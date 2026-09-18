import asyncio
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        headers = {"X-API-Key": "xoUcJ8ATDVe_G352IU8f4u0KF6VDOnqsWESHqHTs_bg"}
        res = await client.get("http://127.0.0.1:8000/api/v1/ideas/saved?email=test@example.com", headers=headers)
        print(res.status_code)
        print(res.text)

if __name__ == "__main__":
    asyncio.run(main())
