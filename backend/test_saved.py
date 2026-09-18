import asyncio
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        res = await client.get("http://127.0.0.1:8000/api/v1/health")
        print(res.json())

        headers = {"X-API-Key": "xoUcJ8ATDVe_G352IU8f4u0KF6VDOnqsWESHqHTs_bg"}
        payload = {
            "email": "test@example.com",
            "idea_key": "test_key",
            "idea_data": {"test": "data"}
        }
        res = await client.post("http://127.0.0.1:8000/api/v1/ideas/saved", json=payload, headers=headers)
        print(res.status_code)
        print(res.text)

if __name__ == "__main__":
    asyncio.run(main())
