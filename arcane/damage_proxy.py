# examples/things_asgi.py

import asyncio
import gzip
import inspect
import io
import json
import typing
import pyvips

# import pandas as pd
import urllib.parse
import dbm
import re
import cairosvg
from starlette.applications import Starlette
from starlette.concurrency import run_in_threadpool
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from starlette.requests import Request
from starlette.responses import Response, RedirectResponse, StreamingResponse
from starlette.routing import Route
from starlette.types import ASGIApp, Receive, Scope, Send
import hashlib
import base64
from wand.api import library
import wand.color
import wand.image
from lib import svg_stack


class GzipRequest(Request):
    async def body(self) -> bytes:
        if not hasattr(self, "_body"):
            body = await super().body()
            if "gzip" in str(self.headers.getlist("Content-Encoding")):
                body = gzip.decompress(body)
            self._body = body
        return self._body


def custom_request_response(func: typing.Callable) -> ASGIApp:
    """
    Takes a function or coroutine `func(request) -> response`,
    and returns an ASGI application.
    """
    is_coroutine = asyncio.iscoroutinefunction(func)

    async def app(scope: Scope, receive: Receive, send: Send) -> None:
        request = GzipRequest(scope, receive=receive, send=send)
        if is_coroutine:
            response = await func(request)
        else:
            response = await run_in_threadpool(func, request)
        await response(scope, receive, send)

    return app


class GzipRoute(Route):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if inspect.isfunction(self.endpoint) or inspect.ismethod(self.endpoint):
            self.app = custom_request_response(self.endpoint)


SVG_HEADER_FROM = len('<svg xmlns="http://www.w3.org/2000/svg" ')
SVG_HEADER_TO = len('width="10000.00" height="10000.00"') + SVG_HEADER_FROM
WH_REGEX = re.compile(r'width="([\d.]+)" height="([\d.]+)"')


DAMAGE_BASE_SVG = """<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!-- Created with Inkscape (http://www.inkscape.org/) -->

<svg
   width="59.789314mm"
   height="28.277973mm"
   viewBox="0 0 59.789314 28.277973"
   version="1.1"
   id="svg5"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg">
  <defs
     id="defs2" />
  <g
     id="layer1"
     transform="translate(-40.587555,-28.403614)">
    <rect
       style="fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.271132;stroke-dasharray:none;stroke-opacity:1"
       id="rect4796"
       width="60.789314"
       height="28.277973"
       x="40.587555"
       y="28.403614" />
    <text
       xml:space="preserve"
       style="font-size:3.175px;fill:#1a1a1a;fill-opacity:1;stroke:#000000;stroke-width:0.265;stroke-dasharray:none;stroke-opacity:1"
       x="41.874802"
       y="31.63348"
       id="text1010"><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke-width:0.265;stroke-dasharray:none"
         x="41.874802"
         y="31.63348"
         id="tspan3631" /><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none;stroke-opacity:1"
         x="41.874802"
         y="35.638985"
         id="tspan3635">STR</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none;stroke-opacity:1"
         x="41.874802"
         y="39.644485"
         id="tspan1012">DEX</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none;stroke-opacity:1"
         x="41.874802"
         y="43.64999"
         id="tspan1014">CON</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none;stroke-opacity:1"
         x="41.874802"
         y="47.655495"
         id="tspan1016">INT</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none;stroke-opacity:1"
         x="41.874802"
         y="51.660995"
         id="tspan1018">WIS</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none;stroke-opacity:1"
         x="41.874802"
         y="55.6665"
         id="tspan1020">CHA</tspan></text>
    <text
       xml:space="preserve"
       style="font-size:3.175px;fill:#1a1a1a;fill-opacity:1;stroke:#000000;stroke-width:0.265;stroke-dasharray:none;stroke-opacity:1"
       x="41.730206"
       y="31.63348"
       id="text1010-1"><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke-width:0.265;stroke-dasharray:none"
         x="41.730206"
         y="31.63348"
         id="tspan1020-5">Ability  Value    Bonus    Total  Mod</tspan></text>
    <text
       xml:space="preserve"
       style="font-size:3.175px;fill:none;stroke:#000000;stroke-width:0.265;stroke-dasharray:none;stroke-opacity:1"
       x="63.542019"
       y="35.638981"
       transform="translate(3)"
       id="text1010-7"><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="63.542019"
         y="35.638981"
         id="tspan1020-2">{str_bonus}</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="63.542019"
         y="39.644485"
         id="tspan3487">{dex_bonus}</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="63.542019"
         y="43.649986"
         id="tspan3489">{con_bonus}</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="63.542019"
         y="47.655491"
         id="tspan3491">{int_bonus}</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="63.542019"
         y="51.660995"
         id="tspan3493">{wis_bonus}</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="63.542019"
         y="55.666496"
         id="tspan3495">{con_bonus}</tspan></text>
    <text
       xml:space="preserve"
       style="font-size:3.175px;fill:none;stroke:#000000;stroke-width:0.265;stroke-dasharray:none;stroke-opacity:1"
       x="75.379501"
       y="35.651382"
       transform="translate(5.1)"
       id="text1010-7-3"><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="75.379501"
         y="35.651382"
         id="tspan1020-2-4">{str_total}</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="75.379501"
         y="39.656887"
         id="tspan3487-8">{dex_total}</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="75.379501"
         y="43.662388"
         id="tspan3489-4">{con_total}</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="75.379501"
         y="47.667892"
         id="tspan3491-0">{int_total}</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="75.379501"
         y="51.673397"
         id="tspan3493-8">{wis_total}</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="75.379501"
         y="55.678898"
         id="tspan3495-9">{cha_total}</tspan></text>
    <text
       xml:space="preserve"
       style="font-size:3.175px;fill:none;stroke:#000000;stroke-width:0.265;stroke-dasharray:none;stroke-opacity:1"
       x="84.190735"
       y="35.651382"
       transform="translate(6)"
       id="text1010-7-3-6"><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="84.190735"
         y="35.651382"
         id="tspan3495-9-9">{str_mod}</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="84.190735"
         y="39.656887"
         id="tspan4174">{dex_mod}</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="84.190735"
         y="43.662388"
         id="tspan4176">{con_mod}</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="84.190735"
         y="47.667892"
         id="tspan4178">{int_mod}</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="84.190735"
         y="51.673397"
         id="tspan4180">{wis_mod}</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="84.190735"
         y="55.678898"
         id="tspan4182">{cha_mod}</tspan></text>
    <text
       xml:space="preserve"
       style="font-size:3.175px;fill:none;stroke:#000000;stroke-width:0.265;stroke-dasharray:none;stroke-opacity:1"
       x="58.67749"
       y="35.459923"
       transform="translate(2)"
       id="text1010-7-5"><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="58.67749"
         y="35.459923"
         id="tspan3495-4">+</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="58.67749"
         y="39.465427"
         id="tspan3621">+</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="58.67749"
         y="43.470928"
         id="tspan3623">+</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="58.67749"
         y="47.476433"
         id="tspan3625">+</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="58.67749"
         y="51.481937"
         id="tspan3627">+</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="58.67749"
         y="55.487438"
         id="tspan3629">+</tspan></text>
    <text
       xml:space="preserve"
       style="font-size:3.175px;fill:none;stroke:#000000;stroke-width:0.265;stroke-dasharray:none;stroke-opacity:1"
       x="70.013939"
       y="35.434341"
       transform="translate(4)"
       id="text1010-7-5-0"><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="70.013939"
         y="35.434341"
         id="tspan3629-8">=</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="70.013939"
         y="39.439846"
         id="tspan3860">=</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="70.013939"
         y="43.445347"
         id="tspan3862">=</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="70.013939"
         y="47.450851"
         id="tspan3864">=</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="70.013939"
         y="51.456356"
         id="tspan3866">=</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="70.013939"
         y="55.461857"
         id="tspan3868">=</tspan></text>
    <text
       xml:space="preserve"
       style="font-size:3.175px;fill:none;stroke:#000000;stroke-width:0.265;stroke-dasharray:none;stroke-opacity:1"
       x="52.260548"
       y="35.651386"
       transform="translate(1)"
       id="text1010-7-1"><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="52.260548"
         y="35.651386"
         id="tspan1020-2-2">{str_val}</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="52.260548"
         y="39.656891"
         id="tspan3487-5">{dex_val}</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="52.260548"
         y="43.662392"
         id="tspan3489-5">{con_val}</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="52.260548"
         y="47.667896"
         id="tspan3491-6">{int_val}</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="52.260548"
         y="51.673401"
         id="tspan3493-6">{wis_val}</tspan><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-family:'Iosevka';-inkscape-font-specification:'Iosevka';fill:#1a1a1a;fill-opacity:1;stroke:none;stroke-width:0.265;stroke-dasharray:none"
         x="52.260548"
         y="55.678902"
         id="tspan3495-8">{cha_val}</tspan></text>
  </g>
</svg>
"""


async def submit(req):
    j = await req.json()
    datahash: str = j["datahash"]
    doc = svg_stack.Document()
    svg_io = io.StringIO()
    key = ""

    if j["type"] == "Damage":
        raw_svg = j["image"]
        image_svg = (
            raw_svg[: raw_svg.index(">") + 1]
            + '<circle r="1e5" fill="white"/>'
            + raw_svg[raw_svg.index(">") + 1 :]
        )

        legend_svg = j["legend"]

        if not image_svg.startswith(
            '<svg xmlns="http://www.w3.org/2000/svg"'
        ) or not legend_svg.startswith('<svg xmlns="http://www.w3.org/2000/svg"'):
            return Response(status_code=400)

        layout = svg_stack.HBoxLayout()
        layout.addSVG(io.BytesIO(image_svg.encode()))
        layout.addSVG(io.BytesIO(legend_svg.encode()))
        doc.setLayout(layout)
        doc.save(svg_io)

        svg_io.seek(0)

        key = (
            base64.urlsafe_b64encode(hashlib.shake_256(datahash.encode()).digest(8))
            .decode()
            .split("=")[0]
        )
        with dbm.open("damage.dbm", "c") as db:
            db[f"{key}|datahash"] = datahash
            db[f"{key}|image"] = svg_io.read()
            db[f"{key}|type"] = "Damage"
    if j["type"] == "PointBuy":
        raw_data = json.loads(j["image"])

        filled_svg = DAMAGE_BASE_SVG.format(
            str_val=str(raw_data["Strength"]["value"]).rjust(2, " "),
            dex_val=str(raw_data["Dexterity"]["value"]).rjust(2, " "),
            con_val=str(raw_data["Constitution"]["value"]).rjust(2, " "),
            int_val=str(raw_data["Intelligence"]["value"]).rjust(2, " "),
            wis_val=str(raw_data["Wisdom"]["value"]).rjust(2, " "),
            cha_val=str(raw_data["Charisma"]["value"]).rjust(2, " "),
            str_bonus=str(raw_data["Strength"]["bonus"]).rjust(2, " "),
            dex_bonus=str(raw_data["Dexterity"]["bonus"]).rjust(2, " "),
            con_bonus=str(raw_data["Constitution"]["bonus"]).rjust(2, " "),
            int_bonus=str(raw_data["Intelligence"]["bonus"]).rjust(2, " "),
            wis_bonus=str(raw_data["Wisdom"]["bonus"]).rjust(2, " "),
            cha_bonus=str(raw_data["Charisma"]["bonus"]).rjust(2, " "),
            str_total=str(
                raw_data["Strength"]["value"] + raw_data["Strength"]["bonus"]
            ).rjust(2, " "),
            dex_total=str(
                raw_data["Dexterity"]["value"] + raw_data["Dexterity"]["bonus"]
            ).rjust(2, " "),
            con_total=str(
                raw_data["Constitution"]["value"] + raw_data["Constitution"]["bonus"]
            ).rjust(2, " "),
            int_total=str(
                raw_data["Intelligence"]["value"] + raw_data["Intelligence"]["bonus"]
            ).rjust(2, " "),
            wis_total=str(
                raw_data["Wisdom"]["value"] + raw_data["Wisdom"]["bonus"]
            ).rjust(2, " "),
            cha_total=str(
                raw_data["Charisma"]["value"] + raw_data["Charisma"]["bonus"]
            ).rjust(2, " "),
            str_mod=str(
                (raw_data["Strength"]["value"] + raw_data["Strength"]["bonus"] - 10)
                // 2
            )
            .rjust(2, "+")
            .replace("-", "−"),
            dex_mod=str(
                (raw_data["Dexterity"]["value"] + raw_data["Dexterity"]["bonus"] - 10)
                // 2
            )
            .rjust(2, "+")
            .replace("-", "−"),
            con_mod=str(
                (
                    raw_data["Constitution"]["value"]
                    + raw_data["Constitution"]["bonus"]
                    - 10
                )
                // 2
            )
            .rjust(2, "+")
            .replace("-", "−"),
            int_mod=str(
                (
                    raw_data["Intelligence"]["value"]
                    + raw_data["Intelligence"]["bonus"]
                    - 10
                )
                // 2
            )
            .rjust(2, "+")
            .replace("-", "−"),
            wis_mod=str(
                (raw_data["Wisdom"]["value"] + raw_data["Wisdom"]["bonus"] - 10) // 2
            )
            .rjust(2, "+")
            .replace("-", "−"),
            cha_mod=str(
                (raw_data["Charisma"]["value"] + raw_data["Charisma"]["bonus"] - 10)
                // 2
            )
            .rjust(2, "+")
            .replace("-", "−"),
        )
        key = (
            base64.urlsafe_b64encode(hashlib.shake_256(datahash.encode()).digest(8))
            .decode()
            .split("=")[0]
        )
        with dbm.open("damage.dbm", "c") as db:
            db[f"{key}|datahash"] = datahash
            db[f"{key}|image"] = filled_svg
            db[f"{key}|type"] = "PointBuy"

    return Response(key, status_code=200)


async def route(req):
    key = req.path_params["key"]
    if key == "favicon.ico":
        return Response(status_code=404)
    with dbm.open("damage.dbm", "r") as db:
        datahash = db[f"{key}|datahash"].decode()
    return Response(content=datahash)
    # return RedirectResponse(url=url, status_code=301)


async def ogImager(req):
    key = req.path_params["key"]
    if key.startswith("favicon.ico"):
        return Response(status_code=404)
    with dbm.open("damage.dbm", "r") as db:
        image_data = db[f"{key}|image"]
        image_type = db.get(f"{key}|type", "Damage".encode()).decode()

    if image_type in ["Damage", "PointBuy"]:
        cairo_out = io.BytesIO()
        cairosvg.svg2png(image_data, write_to=cairo_out, scale=1, dpi=500)
        cairo_out.seek(0)

        return StreamingResponse(content=cairo_out, media_type="image/png")
    # if image_type in ["PointBuy"]:
    #     v = pyvips.Image.svgload_buffer(image_data, dpi=500)
    #     return Response(content=v.jpegsave_buffer(Q=95), media_type="image/jpeg")

    # elif image_type == "PointBuy":
    #     return Response(
    #         content=base64.urlsafe_b64decode(image_data), media_type="image/jpeg"
    #     )


app = Starlette(
    debug=True,
    routes=[
        GzipRoute("/", submit, methods=["POST"]),
        Route("/i/{key}", ogImager, methods=["GET"]),
        Route("/{key}", route, methods=["GET"]),
    ],
    middleware=[
        Middleware(
            CORSMiddleware,
            allow_origins=["https://cephalon.xyz", "http://localhost:10020"],
            allow_methods=["*"],
            allow_headers=["*"],
        ),
        Middleware(GZipMiddleware),
    ],
)

# app = falcon.asgi.App(middleware=HandleCORS())
#
# app.add_route('/i/{short}', ImagePreviewResource())
# app.add_route('/{short}', DamageShortenerResource())
#
# if __name__ == '__main__':
#     uvicorn.run('damage_proxy:app', host='0.0.0.0', port=10021, workers=1, log_level='info', reload=True)
