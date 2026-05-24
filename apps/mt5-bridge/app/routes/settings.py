import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import psycopg2
import psycopg2.extras
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

CONFIG_PATH = (Path(__file__).parent / ".." / ".." / ".." / ".." / "config.json").resolve()
LICENSE_CACHE_PATH = (Path(__file__).parent / ".." / ".." / ".." / ".." / "license-cache.json").resolve()


# ── Bot settings ──────────────────────────────────────────────────────────────

class BotSettings(BaseModel):
    SYMBOL: str = Field(default="SPX500")
    RISK_PERCENT: float = Field(default=1.0, ge=0.1, le=10.0)
    LIVE_TRADING: bool = Field(default=False)
    SIGNAL_COOLDOWN_MINUTES: int = Field(default=30, ge=1, le=1440)


def _read_config() -> BotSettings:
    if CONFIG_PATH.exists():
        return BotSettings(**json.loads(CONFIG_PATH.read_text(encoding="utf-8")))
    return BotSettings()


@router.get("/settings", response_model=BotSettings)
def get_settings():
    return _read_config()


@router.put("/settings", response_model=BotSettings)
def update_settings(payload: BotSettings):
    try:
        CONFIG_PATH.write_text(json.dumps(payload.model_dump(), indent=2), encoding="utf-8")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return payload


# ── License ───────────────────────────────────────────────────────────────────

class LicenseInfo(BaseModel):
    owner_name: str
    mt5_account: int
    trade_mode: str
    allowed_mode: str
    active: bool
    expires_at: Optional[str] = None
    validated_at: str


class LicenseUpdate(BaseModel):
    owner_name: str = Field(min_length=1)
    mt5_account: int = Field(gt=0)
    allowed_mode: str = Field(pattern="^(demo|live|both)$")
    active: bool
    expires_at: Optional[str] = None


def _db_conn():
    url = os.environ.get("DATABASE_URL")
    if not url:
        raise HTTPException(status_code=503, detail="DATABASE_URL not configured in .env")
    try:
        return psycopg2.connect(url, cursor_factory=psycopg2.extras.RealDictCursor)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Cannot connect to database: {exc}") from exc


def _license_key():
    key = os.environ.get("LICENSE_KEY")
    if not key:
        raise HTTPException(status_code=503, detail="LICENSE_KEY not configured in .env")
    return key


@router.get("/license", response_model=LicenseInfo)
def get_license():
    if not LICENSE_CACHE_PATH.exists():
        raise HTTPException(status_code=404, detail="License not validated yet — start the bot first")
    try:
        return LicenseInfo(**json.loads(LICENSE_CACHE_PATH.read_text(encoding="utf-8")))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.put("/license", response_model=LicenseInfo)
def update_license(payload: LicenseUpdate):
    key = _license_key()
    conn = _db_conn()

    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO licenses (license_key, owner_name, mt5_account, allowed_mode, active, expires_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (license_key) DO UPDATE SET
                    owner_name   = EXCLUDED.owner_name,
                    mt5_account  = EXCLUDED.mt5_account,
                    allowed_mode = EXCLUDED.allowed_mode,
                    active       = EXCLUDED.active,
                    expires_at   = EXCLUDED.expires_at
                RETURNING owner_name, mt5_account, allowed_mode, active, expires_at
                """,
                (
                    key,
                    payload.owner_name,
                    payload.mt5_account,
                    payload.allowed_mode,
                    payload.active,
                    payload.expires_at,
                ),
            )
            row = dict(cur.fetchone())
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        conn.close()

    # Actualizar el cache local para que el GET /license refleje el cambio
    now = datetime.now(timezone.utc).isoformat()
    cache = {**row, "trade_mode": _cached_trade_mode(), "validated_at": now}
    if "expires_at" in cache and cache["expires_at"] is not None:
        cache["expires_at"] = str(cache["expires_at"])
    LICENSE_CACHE_PATH.write_text(json.dumps(cache, indent=2, default=str), encoding="utf-8")

    return LicenseInfo(**cache)


def _cached_trade_mode() -> str:
    if LICENSE_CACHE_PATH.exists():
        try:
            return json.loads(LICENSE_CACHE_PATH.read_text(encoding="utf-8")).get("trade_mode", "DEMO")
        except Exception:
            pass
    return "DEMO"
