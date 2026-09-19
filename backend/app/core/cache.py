import hashlib
import json
from collections.abc import Callable
from functools import wraps

from cachetools import TTLCache


def async_cached(cache: TTLCache):
    """
    Async decorator that wraps cachetools.
    Stores the awaited result to prevent "coroutine already awaited" errors.
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Exclude unhashable FastAPI dependencies (like `db: AsyncSession`) from cache key
            cache_kwargs = {k: v for k, v in kwargs.items() if k not in ["db", "_key"]}
            key_str = f"{func.__name__}:{cache_kwargs}"
            key = hashlib.md5(key_str.encode("utf-8")).hexdigest()
            
            if key in cache:
                return cache[key]
            
            result = await func(*args, **kwargs)
            cache[key] = result
            return result
        return wrapper
    return decorator
