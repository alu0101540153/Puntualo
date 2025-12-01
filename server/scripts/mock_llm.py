#!/usr/bin/env python3
import sys
import json
import random
import re
import unicodedata
from pathlib import Path

"""
Improved mock LLM runner.
Loads canned responses from `llm_responses.json` (placed alongside this script).
Accepts JSON on stdin: either `{ messages: [...] }`, `{ text: '...' }`, and may include `db_items: [...]`.
Returns JSON `{ reply: '...' }` with a varied, contextual reply.
"""


def load_payload():
    try:
        raw = sys.stdin.read()
        if not raw:
            return {}
        return json.loads(raw)
    except Exception:
        return {}


def load_responses():
    path = Path(__file__).with_name('llm_responses.json')
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}


def fuzzy_search(text: str, keywords) -> bool:
    # Normalize text and keywords: remove accents, lowercase, collapse whitespace
    def normalize(s: str) -> str:
        s = (s or '').lower()
        s = unicodedata.normalize('NFD', s)
        s = ''.join(ch for ch in s if unicodedata.category(ch) != 'Mn')
        s = re.sub(r"[^a-z0-9ñ ]", ' ', s)
        s = re.sub(r"\s+", ' ', s).strip()
        return s

    def levenshtein(a: str, b: str) -> int:
        # simple iterative DP implementation
        if a == b:
            return 0
        la, lb = len(a), len(b)
        if la == 0:
            return lb
        if lb == 0:
            return la
        prev = list(range(lb + 1))
        for i, ca in enumerate(a, start=1):
            cur = [i] + [0] * lb
            for j, cb in enumerate(b, start=1):
                cost = 0 if ca == cb else 1
                cur[j] = min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
            prev = cur
        return prev[lb]

    t = normalize(text)
    tokens = t.split()

    for kw in keywords:
        kw_norm = normalize(kw)
        if not kw_norm:
            continue
        # If keyword is multi-word, check substring in text (strong match)
        if ' ' in kw_norm:
            if kw_norm in t:
                return True
            # also check tokens sequence
            parts = kw_norm.split()
            idx = 0
            for p in parts:
                try:
                    idx = tokens.index(p, idx) + 1
                except ValueError:
                    idx = -1
                    break
            if idx != -1:
                return True

        # substring check (helps with accents removed)
        if kw_norm in t:
            return True

        # token-level fuzzy match using Levenshtein distance
        for tok in tokens:
            # set threshold relative to keyword length
            thresh = 1 if len(kw_norm) <= 4 else 2
            if levenshtein(tok, kw_norm) <= thresh:
                return True

    return False


def choose(responses_list):
    if isinstance(responses_list, list) and responses_list:
        return random.choice(responses_list)
    return ''


def build_recommendation_reply(items, n=3):
    if not items:
        return None
    chosen = items[:n]
    lines = []
    for it in chosen:
        title = it.get('title') or (it.get('data') or {}).get('title') or it.get('name')
        year = (it.get('data') or {}).get('year')
        kind = it.get('itemType') or it.get('type') or ''
        if year:
            lines.append(f"- {title} ({year}) — {kind}")
        else:
            lines.append(f"- {title} — {kind}")
    header = f"Te recomiendo {len(chosen)} opción(es):"
    return header + "\n" + "\n".join(lines)


def respond(payload, responses):
    # Get last user content from messages or direct text
    messages = payload.get('messages') or []
    last = ''
    for m in reversed(messages):
        if m.get('role') == 'user':
            last = m.get('content')
            break
    if not last:
        last = payload.get('text', '')

    q = (last or '').strip()
    q_low = q.lower()

    # simple intent checks
    if fuzzy_search(q_low, ['hola', 'buenas', 'hello', 'hi']):
        reply = choose(responses.get('greetings'))
    elif fuzzy_search(q_low, ['como estas', 'qué tal', 'como estás', 'how are you', 'how are u']):
        reply = choose(responses.get('howareyou'))
    elif fuzzy_search(q_low, ['adios', 'hasta luego', 'bye', 'chau']):
        reply = choose(responses.get('farewells'))
    elif fuzzy_search(q_low, ['gracias', 'thank you', 'thanks']):
        reply = choose(responses.get('thanks'))
    elif fuzzy_search(q_low, ['chiste', 'broma', 'joke']):
        reply = choose(responses.get('jokes'))
    elif fuzzy_search(q_low, ['qué puedes', 'puedes hacer', 'que haces', 'capacidad', 'capabilities']):
        reply = choose(responses.get('capabilities'))
    elif fuzzy_search(q_low, ['dime', 'recomienda', 'recomendame', 'sugerencia', 'sugiere', 'buscar']):
        # recommendation intent: detect kind and genre
        kind = None
        if fuzzy_search(q_low, ['pelicula', 'películas', 'peliculas', 'movie', 'film']):
            kind = 'movie'
        elif fuzzy_search(q_low, ['serie', 'series', 'tv', 'show']):
            kind = 'serie'
        elif fuzzy_search(q_low, ['libro', 'libros', 'book']):
            kind = 'book'

        genres_ref = ['accion', 'acción', 'comedia', 'romance', 'romántica', 'drama', 'terror', 'suspenso', 'suspense', 'ciencia ficcion', 'fantasia', 'documental']
        found_genre = None
        for g in genres_ref:
            if fuzzy_search(q_low, [g]):
                found_genre = g
                break

        # If the payload included DB search results, use them to build a concrete reply
        db_items = payload.get('db_items')
        if isinstance(db_items, list) and db_items:
            r = build_recommendation_reply(db_items, n=3)
            reply = r if r else choose(responses.get('fallback_questions'))
        else:
            if kind and found_genre:
                reply = choose(responses.get('acknowledge')) + ' ' + choose(responses.get('more_variants'))
            elif kind and not found_genre:
                reply = choose(responses.get('clarify_more'))
            else:
                reply = choose(responses.get('clarify_more'))
    else:
        # small talk or fallback
        if fuzzy_search(q_low, ['planes', 'visto', 'vista', 'vista recientemente', 'visto alguna']):
            reply = choose(responses.get('smalltalk'))
        else:
            reply = choose(responses.get('fallback_questions'))

    if not reply:
        reply = 'Lo siento, no puedo ayudarte ahora mismo con eso. Prueba a pedirme recomendaciones por género.'

    print(json.dumps({'reply': reply}, ensure_ascii=False))


def main():
    payload = load_payload()
    responses = load_responses()
    respond(payload, responses)


if __name__ == '__main__':
    main()

