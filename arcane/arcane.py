# examples/things_asgi.py
import json
import traceback

import numpy as np
import pandas as pd
import falcon
import falcon.asgi
import starlette.requests
import starlette.responses
import uvicorn
import math
import base64
import collections
import logging

from falcon import HTTPStatus
import math

CONDITION_IMMUNITIES = pd.read_feather("data/condition_immunities.feather")
PERCEPTION = pd.read_feather("data/perception.feather")
SAVES = pd.read_feather("data/saves_by_cr.feather")
TO_HITS = pd.read_feather("data/monster_to_hits.feather")

with open("data/coautl_spells_by_target.json", "r", encoding="utf-8") as bytarget:
    with open("data/coautl_targets_by_spell.json", "r", encoding="utf-8") as byspell:
        COUATL = {"hierarchy": json.load(bytarget), "bySpell": json.load(byspell)}

with open(
    "data/ancient_gold_dragon_spells_by_target.json", "r", encoding="utf-8"
) as bytarget:
    with open(
        "data/ancient_gold_dragon_targets_by_spell.json", "r", encoding="utf-8"
    ) as byspell:
        ANCIENTGOLDDRAGON = {
            "hierarchy": json.load(bytarget),
            "bySpell": json.load(byspell),
        }


MONSTER_TYPES = [
    "humanoid",
    "aberration",
    "fiend",
    "monstrosity",
    "undead",
    "dragon",
    "ooze",
    "fey",
    "elemental",
    "giant",
    "beast",
    "construct",
    "plant",
    "celestial",
]
CONDITIONS = [
    f"conditionImmune{c.title()}"
    for c in [
        "blinded",
        "charmed",
        "deafened",
        "exhaustion",
        "frightened",
        "grappled",
        "incapacitated",
        "invisible",
        "paralyzed",
        "petrified",
        "poisoned",
        "prone",
        "restrained",
        "stunned",
        "unconscious",
    ]
]

BOOKS = [
    "AI",
    "AitFR-ISF",
    "AitFR-THP",
    "AitFR-DN",
    "AitFR-FCD",
    "BGDIA",
    "CM",
    "CoS",
    "DC",
    "DIP",
    "DMG",
    "DoD",
    "EGW",
    "ERLW",
    "ESK",
    "FTD",
    "GGR",
    "GoS",
    "HftT",
    "HoL",
    "HotDQ",
    "IDRotF",
    "IMR",
    "KKW",
    "LLK",
    "LMoP",
    "LR",
    "MaBJoV",
    "MFF",
    "MM",
    "MPMM",
    "MOT",
    "MTF",
    "NRH-TCMC",
    "NRH-AVitW",
    "NRH-ASS",
    "NRH-CoI",
    "NRH-TLT",
    "NRH-AWoL",
    "NRH-AT",
    "OotA",
    "OoW",
    "PSA",
    "PSD",
    "PSI",
    "PSK",
    "PSX",
    "PSZ",
    "PHB",
    "PotA",
    "RMBRE",
    "RoT",
    "RtG",
    "SADS",
    "SCC",
    "SDW",
    "SKT",
    "SLW",
    "TCE",
    "TTP",
    "TftYP",
    "ToA",
    "VGM",
    "VRGR",
    "XGE",
    "UA2020SubclassesPt2",
    "UA2020SubclassesPt5",
    "UA2020SpellsAndMagicTattoos",
    "UA2021DraconicOptions",
    "UA2021MagesOfStrixhaven",
    "UAArtificerRevisited",
    "UAClassFeatureVariants",
    "UAClericDruidWizard",
    "WBtW",
    "WDH",
    "WDMM",
]
# CONDITION_IMMUNITIES.to_csv("dummyy")

# examples/things_asgi.py

import asyncio
import gzip
import inspect
import io
import typing

# import pandas as pd
import urllib.parse
import dbm
import re
# import cairosvg
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


async def couatl(req: starlette.requests.Request):
    return starlette.responses.JSONResponse(COUATL)


async def ancientgolddragon(req: starlette.requests.Request):
    return starlette.responses.JSONResponse(ANCIENTGOLDDRAGON)


async def saves(req: starlette.requests.Request):
    bin_size = int(req.query_params["binSize"])
    bin_left = req.query_params["binLeft"] == "true"
    sources = req.query_params["sources"].split(",")
    cr_min = float(req.query_params["crMin"])
    cr_max = float(req.query_params["crMax"])
    creature_type = req.query_params["creatureType"]
    bin_padding = (math.ceil(cr_max) - math.floor(cr_min)) % bin_size

    if bin_left:
        bins_boundless = list(
            range(math.floor(cr_min), math.ceil(cr_max) + 1, bin_size)
        )

    else:
        bins_boundless = list(
            range(math.floor(cr_min) + bin_padding, math.floor(cr_max), bin_size)
        )

    bins = sorted(list(set([0] + bins_boundless + [30])))

    all_stats = SAVES["saveBonus"].describe()

    filtered_saves = SAVES[
        (SAVES["cr_num"] >= cr_min)
        & (SAVES["cr_num"] <= cr_max)
        & (SAVES["source"].isin(sources))
    ].copy()


    if creature_type != "all":
        filtered_saves = filtered_saves[filtered_saves["type"] == creature_type]

    filtered_saves["saveBonus"] = filtered_saves["saveBonus"].astype(int)

    type_count = len(filtered_saves.drop_duplicates(subset=["name"]).index)

    filtered_saves.loc[:, "cr_bin"] = pd.cut(filtered_saves.loc[:, "cr_num"], bins=bins)

    filtered_saves.drop(
        ["cr_num", "source", "type", "name"], axis="columns", inplace=True
    )

    grp = filtered_saves.groupby(["saveType", "cr_bin"]).agg(list)

    grp["saveBonus"] = grp["saveBonus"].apply(
        lambda x: x if isinstance(x, list) else []
    )
    grp.to_csv("grp.csv")

    data = dict(tuple(grp.groupby("saveType")))
    dat = collections.defaultdict(lambda: collections.defaultdict(lambda: dict()))
    for saveType in data:
        save_type_data = data[saveType]
        save_type_data.to_csv(f"{saveType}.csv")
        for (_, interval), saves in save_type_data.itertuples():
            dat[saveType]["binData"][str(interval)] = [
                {"value": k, "count": v}
                for k, v in sorted(
                    collections.Counter([int(save) for save in saves]).items()
                )
            ]
            desc = pd.Series(saves).explode().dropna().astype(int).describe()

            min_ = desc.get("min", 0)
            max_ = desc.get("max", 0)
            median_ = desc.get("50%", 0)
            fq_ = desc.get("25%", 0)
            tq_ = desc.get("75%", 0)
            count_ = desc.get("count", 0)

            dat[saveType]["boxplot"][str(interval)] = {
                "x": saveType,
                "min": min_ if not pd.isna(min_) else 0,
                "max": max_ if not pd.isna(max_) else 0,
                "median": median_ if not pd.isna(median_) else 0,
                "firstQuartile": fq_ if not pd.isna(fq_) else 0,
                "thirdQuartile": tq_ if not pd.isna(tq_) else 0,
                "count": count_ if not pd.isna(count_) else 0,
            }

    return starlette.responses.JSONResponse(
        content={
            "saveData": dat,
            "typeCount": type_count,
            "saveRange": [all_stats["min"], all_stats["max"]],
        }
    )


async def to_hits(req: starlette.requests.Request):
    bin_size = int(req.query_params["binSize"])
    bin_left = req.query_params["binLeft"] == "true"
    sources = req.query_params["sources"].split(",")
    cr_min = float(req.query_params["crMin"])
    cr_max = float(req.query_params["crMax"])
    creature_types = req.query_params["creatureTypes"].split(",")
    bin_padding = (math.ceil(cr_max) - math.floor(cr_min)) % bin_size
    print(creature_types)
    if bin_left:
        bins_boundless = list(
            range(math.floor(cr_min), math.ceil(cr_max) + 1, bin_size)
        )

    else:
        bins_boundless = list(
            range(math.floor(cr_min) + bin_padding, math.floor(cr_max), bin_size)
        )

    bins = sorted(list(set([0] + bins_boundless + [30])))

    all_stats = TO_HITS["to_hits"].describe()

    filtered_to_hits = TO_HITS[
        (TO_HITS["cr_num"] >= cr_min)
        & (TO_HITS["cr_num"] <= cr_max)
        & (TO_HITS["source"].isin(sources))
    ].copy()

    if "all" not in creature_types:
        filtered_to_hits = filtered_to_hits[
            filtered_to_hits["type"].isin(creature_types)
        ]

    deduped = filtered_to_hits.drop_duplicates(subset=["name"])
    type_count = dict(collections.Counter(deduped["type"]))
    type_count["all"] = len(deduped.index)

    filtered_to_hits.loc[:, "cr_bin"] = pd.cut(
        filtered_to_hits.loc[:, "cr_num"], bins=bins
    )

    filtered_to_hits.drop(
        ["cr_num", "source", "type", "name"], axis="columns", inplace=True
    )

    grp = filtered_to_hits.groupby(["cr_bin"]).agg(list)

    dat = collections.defaultdict(lambda: dict())
    for interval, hits in grp.iterrows():
        hits = hits.explode().dropna().astype(int)
        dat["binData"][str(interval)] = [
            {"value": k, "count": v}
            for k, v in sorted(collections.Counter(hits).items())
        ]
        desc = hits.describe()
        min_ = desc.get("min", 0)
        max_ = desc.get("max", 0)
        mean_ = desc.get("mean", 0)
        median_ = desc.get("50%", 0)
        fq_ = desc.get("25%", 0)
        tq_ = desc.get("75%", 0)
        count_ = desc.get("count", 0)

        dat["boxplot"][str(interval)] = {
            "x": str(interval),
            "min": min_ if not pd.isna(min_) else 0,
            "max": max_ if not pd.isna(max_) else 0,
            "median": median_ if not pd.isna(median_) else 0,
            "mean": mean_ if not pd.isna(mean_) else 0,
            "firstQuartile": fq_ if not pd.isna(fq_) else 0,
            "thirdQuartile": tq_ if not pd.isna(tq_) else 0,
            "count": count_ if not pd.isna(count_) else 0,
        }

    return starlette.responses.JSONResponse(
        content={
            "hitData": dat,
            "typeCounts": type_count,
            "hitRange": [all_stats["min"], all_stats["max"]],
        }
    )


async def conditions(req: starlette.requests.Request):
    cr_include = [int(x) for x in req.query_params["crInclude"].split(",")]
    creature_type_include = req.query_params["creatureTypeInclude"].lower().split(",")
    books = req.query_params["sources"].split(",")

    cr_book_filtered = CONDITION_IMMUNITIES[
        (CONDITION_IMMUNITIES["cr_num"] >= cr_include[0])
        & (CONDITION_IMMUNITIES["cr_num"] <= cr_include[1])
        & CONDITION_IMMUNITIES["source"].isin(books)
        & CONDITION_IMMUNITIES["type"].isin(creature_type_include + ["all"])
    ]

    print(cr_book_filtered.head(), flush=True)
    

    type_counts = (
        cr_book_filtered.drop_duplicates(subset=["name"])["type"]
        .value_counts()
        .to_dict()
    )
    type_counts["all"] = sum(
        v for k, v in type_counts.items() if k in creature_type_include
    )

    # condition_immune_names = cr_book_filtered[cr_book_filtered["conditionImmune"]]

    names = cr_book_filtered[cr_book_filtered["conditionImmune"]].pivot_table(
        values="name",
        index="type",
        columns="variable",
        aggfunc=lambda x: sorted(x),
        dropna=False,
    )
    names = names[sorted(names.columns, reverse=True)]
    names_t = names.transpose()
    # names_t.to_csv("dummy2.csv")
    names_t = pd.concat(
        [names_t]
        + [
            pd.DataFrame.from_dict(
                {creature_type: [[]] for creature_type in MONSTER_TYPES + ["all"]}
                | {"index": i}
            ).set_index("index", drop=True)
            for i in CONDITIONS
            if i not in names_t.index
        ],
        sort=True,
    )
    names_t.sort_index(inplace=True)
    names_t = names_t[
        [x for x in sorted(creature_type_include) if x in names_t.columns] + ["all"]
    ]
    names_t = names_t.fillna("").applymap(list)

    # names_t.to_csv("dummy.csv")

    immunities = cr_book_filtered.pivot_table(
        values="conditionImmune",
        index="type",
        columns="variable",
        aggfunc="mean",
        dropna=False,
    )
    immunities = immunities[sorted(immunities.columns, reverse=True)]
    immunities_t = immunities.transpose()
    immunities_t = immunities_t[
        [x for x in sorted(creature_type_include) if x in immunities_t.columns]
        + ["all"]
    ]
    return starlette.responses.JSONResponse(
        content={
            "column_labels": list(immunities_t.columns),
            "row_labels": [
                str(c).removeprefix("conditionImmune") for c in immunities_t.index
            ],
            "data": [
                {
                    "bin": i,
                    "bins": [
                        {"count": math.ceil(value * 100), "bin": index}
                        for (index, value) in enumerate(immunities_t.iloc[:, i - 1], 1)
                    ],
                }
                for i in range(1, len(immunities_t.columns) + 1)
            ],
            "names": names_t.values.tolist()[::-1],
            "typeCounts": type_counts,
        }
    )


app = Starlette(
    debug=True,
    routes=[
        GzipRoute("/conditions", conditions, methods=["GET"]),
        GzipRoute("/couatl", couatl, methods=["GET"]),
        GzipRoute("/ancient_gold_dragon", ancientgolddragon, methods=["GET"]),
        GzipRoute("/saves", saves, methods=["GET"]),
        GzipRoute("/to_hits", to_hits, methods=["GET"]),
    ],
    middleware=[
        Middleware(
            CORSMiddleware,
            allow_origins=["https://cephalon.xyz", "http://localhost:10020"],
            allow_methods=["*"],
            allow_headers=["*"],
            allow_credentials=True,
        ),
        Middleware(GZipMiddleware),
    ],
)

# class ConditionImmunityResource:
#     async def on_get(self, req, resp):


# class HandleCORS(object):
#     async def process_request(self, req, resp):
#
# #         print((req.headers), flush=True)
#
#         resp.set_header('Access-Control-Allow-Origin', 'https://cephalon.xyz')
#         resp.set_header('Access-Control-Allow-Methods', '*')
#         resp.set_header('Access-Control-Allow-Headers', '*')
# #         resp.set_header('Access-Control-Max-Age', 1728000)  # 20 days
#         if req.method == 'OPTIONS':
#             raise HTTPStatus(falcon.HTTP_200, body='\n')
#
# app = falcon.asgi.App(middleware=HandleCORS())
# #app = falcon.asgi.App(
# #    middleware=falcon.CORSMiddleware(
# #        allow_origins=['https://cephalon.xyz', 'http://localhost:10020'],
# #        allow_credentials='*'))
#
# app.add_route('/conditions', ConditionImmunityResource())
#
# if __name__ == '__main__':
#     uvicorn.run('arcane:app', host='0.0.0.0', port=10019, workers=1, log_level='info')
