# Развёртывание RE ZERO CRM на сервере

Инструкция для обычного VPS (виртуального сервера) на Ubuntu с установленным Docker.
Каждую команду можно скопировать и вставить в терминал как есть.

## Что понадобится

- VPS с Ubuntu 22.04+ (например, DigitalOcean, Hetzner, Timeweb). Минимальной конфигурации
  (1 CPU, 1-2 ГБ RAM) достаточно для 2 пользователей.
- Домен, направленный на IP сервера (A-запись) — нужен для автоматического HTTPS.
  Без домена приложение всё равно можно поднять, но без шифрования — см. раздел
  «Если домена пока нет» ниже.

## 1. Установить Docker на сервере

Подключитесь по SSH к серверу и выполните:

```bash
curl -fsSL https://get.docker.com | sh
```

Проверить, что всё установилось:

```bash
docker --version
docker compose version
```

## 2. Скопировать проект на сервер

Проще всего — через приватный git-репозиторий:

```bash
git clone <ссылка на ваш репозиторий> re-zero-crm
cd re-zero-crm/docker
```

(Если репозитория пока нет — можно скопировать папку проекта через `scp` или SFTP.)

## 3. Настроить переменные окружения

```bash
cp .env.example .env
nano .env
```

Заполните:
- `DOMAIN` — ваш домен (например, `crm.rezero.kz`)
- `POSTGRES_PASSWORD` — придумайте надёжный пароль
- `SESSION_SECRET` — сгенерируйте командой ниже и вставьте результат:
  ```bash
  openssl rand -base64 32
  ```
- `SEED_USER_1_*` / `SEED_USER_2_*` — email, имя и пароль для входа владельца и партнёра

Сохраните файл (в nano: Ctrl+O, Enter, Ctrl+X).

## 4. Запустить

На сервере с 1 ГБ+ свободной RAM просто соберите образ на месте:

```bash
docker compose up -d --build
```

**На слабом сервере (512 МБ-1 ГБ RAM)** сборка `next build` прямо на сервере может уйти
в своп и работать очень медленно или уронить память. В этом случае лучше не собирать
образ на сервере, а скачать уже готовый — его собирает GitHub Actions при каждом пуше
в `main` (см. `.github/workflows/docker-publish.yml`) и публикует в
`ghcr.io/<ваш GitHub логин>/re-zero-crm`. Добавьте в `.env`:

```bash
APP_IMAGE=ghcr.io/<ваш GitHub логин>/re-zero-crm:latest
```

и запускайте так — образ приложения только скачивается, а не собирается:

```bash
docker compose pull app
docker compose up -d
```

(Первый раз убедитесь, что пакет `re-zero-crm` в GitHub сделан публичным —
Settings пакета → Change visibility → Public — иначе `docker pull` попросит логин.)

Первый запуск поднимет три контейнера: базу данных, приложение и Caddy (автоматический
HTTPS). Приложение само применит миграции базы при старте.

Затем, только один раз при первом запуске, создайте 2 учётные записи (владелец и партнёр)
из данных `SEED_USER_1_*` / `SEED_USER_2_*` в `.env`:

```bash
docker compose exec app npm run db:seed
```

Повторно запускать эту команду не нужно (и не стоит — она перезапишет пароли обратно на
значения из `.env`, даже если вы уже сменили их через страницу «Настройки» в самом
приложении). Меняйте пароль только через интерфейс CRM после первого входа.

Проверить, что всё работает:

```bash
docker compose ps
docker compose logs -f app
```

Откройте `https://<ваш домен>` в браузере и войдите под данными из `SEED_USER_1_*`.

## 5. Резервные копии

```bash
./backup.sh
```

Создаёт файл в `docker/backups/`. Рекомендуется добавить в cron (например, раз в сутки)
и периодически скачивать бэкапы с сервера себе на компьютер — папка `backups/` живёт
только на сервере и не копируется автоматически никуда ещё.

Пример cron-задачи (раз в сутки в 3:00):

```bash
crontab -e
# добавить строку:
0 3 * * * cd /root/re-zero-crm/docker && ./backup.sh >> backup.log 2>&1
```

## 6. Обновление после изменений в коде

```bash
cd re-zero-crm
git pull
cd docker
docker compose up -d --build
```

## Если домена пока нет

Порт 3000 в `docker-compose.yml` привязан только к `127.0.0.1` (localhost) — снаружи
недоступен вообще, ни с доменом, ни без. Это осознанно: отдавать вход в CRM (пароли) по
незашифрованному HTTP напрямую наружу небезопасно, даже временно.

Вместо настоящего домена можно бесплатно и мгновенно получить рабочий поддомен через
[sslip.io](https://sslip.io) — он resolve'ится в IP вашего сервера безо всякой настройки DNS:
если IP сервера, например, `159.65.231.17`, то домен `crm.159-65-231-17.sslip.io` уже
работает и указывает на этот сервер. Впишите его в `DOMAIN=` в `.env` — дальше Caddy
(или ваш существующий nginx, см. ниже) получит для него настоящий Let's Encrypt-сертификат
как для обычного домена. Когда появится нормальный домен — просто замените `DOMAIN` и
перезапустите.

## Если на сервере уже есть другой сайт на nginx (порты 80/443 заняты)

Тогда Caddy из `docker-compose.yml` не поднимайте вообще (`docker compose up -d db app` —
без `caddy`), а добавьте CRM отдельным сайтом в уже работающий nginx, не трогая
существующие конфиги:

```bash
cat > /etc/nginx/sites-available/re-zero-crm <<'EOF'
server {
    listen 80;
    server_name crm.ВАШ-IP-С-ДЕФИСАМИ.sslip.io;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
ln -sf /etc/nginx/sites-available/re-zero-crm /etc/nginx/sites-enabled/re-zero-crm
nginx -t && systemctl reload nginx
certbot --nginx -d crm.ВАШ-IP-С-ДЕФИСАМИ.sslip.io --non-interactive --agree-tos -m ваш-email --redirect
```

Проверьте `nginx -t` перед `reload` — если конфиг невалиден, существующий сайт не пострадает
только если вы не тронули его файлы (мы добавляем новый файл, не редактируем старые).
