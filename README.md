## docker

docker compose up --build

## create /videos if not exists

in root. /videos

## add your video example

/videos/input.mp4

## post

http://localhost:3000/videos

{
"inputPath": "/videos/input.mp4"
}

# response

{
"id": "f3ef1127-b8f3-4726-9f31-fa370e195ef9",
"status": "processing"
}

## wait

m3u8 will be created on /videos/:id

## preview

use the id in front

http://localhost:5174/
