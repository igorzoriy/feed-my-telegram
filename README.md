# Feed My Telegram

This service checks RSS/Facebook/Twitter sources and publish new entities to Telegram.

## Sources
You should have json file with feed sources. You can use https://gist.github.com/ for it.
`source.json` example:
```
[
    {
        "type": "rss",
        "uri": "http://lorem-rss.herokuapp.com/feed?unit=second&interval=60",
        "channelId": "-100123456789"
    },
    {
        "type": "rss",
        "uri": "http://lorem-rss.herokuapp.com/feed?unit=second&interval=30",
        "channelId": "-100123456789"
    },
    {
        "type": "twitter",
        "screenName": "nodejs",
        "channelId": "-100123456789"
    }
]
```

## Telegram Access Token
For getting telegram access token you should create telegram bot. More information here: https://core.telegram.org/bots#botfather


## Development
Create .env file for development
```sh
$ cp .env.defaults .env
```
and set env variables.

## Deployment
1) Set production docker machine
```sh
$ eval $(docker-machine env vm-common)
```
2) Create .env file for production
```sh
$ cp .env.defaults .env.prod
```

3) Set env variables

4) Deploy using docker
```sh
$ docker-compose up --build -d fmt
```
