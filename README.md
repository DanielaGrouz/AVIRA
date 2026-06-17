### Before Start

install docker desktop and open it on your computer
and than run:

1.  create local mysql
```
cd backend
docker-compose up -d
```

2. add mock data

```
cd backend
npm run seed
```

3. run frontend and backend
```
cd backend
npm run start
```

```
cd frontend
npm run start
```