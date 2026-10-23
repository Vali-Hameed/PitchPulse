"""Agent 3: Persona & Localization Router.

Transforms verified tactical insights into 3 distinct viewing modes:
- Tactical Analyst (compactness, half-spaces, ΔxT, spatial shape)
- Casual Fan (momentum, energy, excitement, crowd narrative)
- Player-Cam Focus (dedicated telemetry tracking for #8 Marcus Vance)
Across 3 broadcast languages: English (EN), Spanish (ES), and Arabic (AR).
"""

from __future__ import annotations

import logging
from typing import Any, Dict, Optional
from app.agents.llm import llm_client
from app.models.schemas import ComputedMetrics, PersonaOutputs, RawMatchEvent

logger = logging.getLogger("pitchpulse.persona")


class PersonaRouter:
    """Agent 3: Audience Persona & Multilingual Broadcast Router."""

    def __init__(self) -> None:
        self.llm = llm_client

    def _generate_fallback_personas(
        self,
        verified_narrative: str,
        event: RawMatchEvent,
        metrics: ComputedMetrics,
        trigger_reason: Optional[str],
    ) -> PersonaOutputs:
        """Hand-authored professional broadcast translations across personas and languages."""
        actor = event.actor_name
        bypassed = event.defenders_bypassed
        xt = metrics.xt_delta
        spd = round(event.ball_speed_kmh, 0)
        pres = round(metrics.pressure_index, 0)

        # 1. English (EN)
        en_analyst = (
            f"Tactical Analysis: {actor} breaks lines in the half-space, bypassing {bypassed} defensive units "
            f"under {pres:.0f}% pressure to unlock a high-value +{xt:.2f} xT corridor."
        )
        en_casual = (
            f"What a moment! {actor} cuts straight through the defense with ice in their veins, "
            f"igniting the stadium with a brilliant pass!"
        )
        en_player = (
            f"#8 Vance Cam: Precision vision on display. Maneuvers under {pres:.0f}% pressure with 88% stamina, "
            f"distributing at {spd:.0f} km/h to dictate offensive tempo."
        )

        # 2. Spanish (ES)
        es_analyst = (
            f"Análisis Táctico: {actor} rompe líneas en el pasillo interior, superando a {bypassed} defensores "
            f"bajo {pres:.0f}% de presión para generar un corredor de +{xt:.2f} xT."
        )
        es_casual = (
            f"¡Qué jugada sensacional! {actor} desmantela la zaga rival con pura calidad, "
            f"encendiendo las gradas con una visión magistral."
        )
        es_player = (
            f"Cámara #8 Vance: Control total del ritmo. Resiste {pres:.0f}% de presión con 88% de resistencia física, "
            f"asistiendo a {spd:.0f} km/h para liderar el ataque."
        )

        # 3. Arabic (AR) - Authentic football broadcast phrasing
        ar_analyst = (
            f"تحليل تكتيكي: {actor} يخترق خطوط الضغط في نصف المساحة، متجاوزاً {bypassed} مدافعين "
            f"تحت ضغط {pres:.0f}% ليصنع مسار خطورة متوقعة بقيمة +{xt:.2f} xT."
        )
        ar_casual = (
            f"يا له من سحر كروي! {actor} يخترق الدفاع ببراعة استثنائية "
            f"ويشعل حماس الجماهير بتمريرة حاسمة خارقة!"
        )
        ar_player = (
            f"كاميرا النجم رقم 8 فانس: رؤية تكتيكية ملهمة تحت ضغط {pres:.0f}% ولياقة 88%، "
            f"موجهاً الكرة بسرعة {spd:.0f} كم/س ليقود إيقاع الهجوم."
        )

        # 4. Korean (KO) - Authentic football broadcast phrasing
        ko_analyst = (
            f"전술 분석: {actor} 선수가 하프스페이스에서 라인 브레이킹을 성공시키며 "
            f"{pres:.0f}% 압박 속에서 {bypassed}명의 수비수를 제치고 +{xt:.2f} xT 공격 기회를 창출했습니다."
        )
        ko_casual = (
            f"환상적인 플레이! {actor} 선수가 번개 같은 판단력으로 상대 수비진을 완전히 허물며 "
            f"경기장 분위기를 뜨겁게 달굽니다!"
        )
        ko_player = (
            f"스타 캠 ({actor}): {pres:.0f}% 압박 상황 속에서도 침착한 시야 확보. "
            f"{spd:.0f} km/h의 템포 조율로 팀의 공격 전개를 결정적으로 주도합니다."
        )

        # 5. French (FR) - Authentic Ligue 1 / Canal+ broadcast phrasing
        fr_analyst = (
            f"Analyse Tactique : {actor} casse les lignes dans le demi-espace, éliminant {bypassed} défenseurs "
            f"sous {pres:.0f}% de pression pour ouvrir un corridor à +{xt:.2f} xT."
        )
        fr_casual = (
            f"Quel coup d'éclat ! {actor} transperce la défense adverse avec un sang-froid magistral "
            f"et enflamme le stade avec une passe sublime !"
        )
        fr_player = (
            f"Caméra Star ({actor}) : Vision chirurgicale sous {pres:.0f}% de pressing avec 88% d'endurance, "
            f"dictant le tempo offensif à {spd:.0f} km/h."
        )

        # 6. Portuguese (PT) - Authentic Brazilian / Portuguese broadcast phrasing
        pt_analyst = (
            f"Análise Tática: {actor} quebra as linhas no meio-espaço, superando {bypassed} defensores "
            f"sob {pres:.0f}% de pressão para criar um corredor de +{xt:.2f} xT."
        )
        pt_casual = (
            f"Que jogada espetacular! {actor} destrói a defesa adversária com pura categoria, "
            f"levantando a torcida com um passe genial!"
        )
        pt_player = (
            f"Câmera Craque ({actor}): Leitura de jogo de alto nível sob {pres:.0f}% de pressão, "
            f"distribuindo a {spd:.0f} km/h para ditar o ritmo de ataque."
        )

        # 7. German (DE) - Authentic Bundesliga / Sky Sport broadcast phrasing
        de_analyst = (
            f"Taktische Analyse: {actor} bricht im Halbraum durch die Linien, überspielt {bypassed} Verteidiger "
            f"unter {pres:.0f}% Druck und öffnet einen +{xt:.2f} xT Korridor."
        )
        de_casual = (
            f"Was für ein Traumpass! {actor} hebelt die Abwehr mit eiskalter Übersicht aus "
            f"und bringt das Stadion zum Kochen!"
        )
        de_player = (
            f"Star-Kamera ({actor}): Maximale Spielkontrolle unter {pres:.0f}% Gegnerdruck bei 88% Physis, "
            f"taktet den Angriff mit {spd:.0f} km/h."
        )

        translations: Dict[str, Dict[str, str]] = {
            "en": {
                "headline": f"{actor} Unlocks Defensive Block",
                "analyst": en_analyst,
                "casual": en_casual,
                "player_focus": en_player,
            },
            "es": {
                "headline": f"{actor} Desbloquea el Bloque Defensivo",
                "analyst": es_analyst,
                "casual": es_casual,
                "player_focus": es_player,
            },
            "ar": {
                "headline": f"{actor} يفكك التكتل الدفاعي ببراعة",
                "analyst": ar_analyst,
                "casual": ar_casual,
                "player_focus": ar_player,
            },
            "ko": {
                "headline": f"{actor} 수비 블록 돌파 성공",
                "analyst": ko_analyst,
                "casual": ko_casual,
                "player_focus": ko_player,
            },
            "fr": {
                "headline": f"{actor} Transperce le Bloc Défensif",
                "analyst": fr_analyst,
                "casual": fr_casual,
                "player_focus": fr_player,
            },
            "pt": {
                "headline": f"{actor} Desmonta o Bloqueio Defensivo",
                "analyst": pt_analyst,
                "casual": pt_casual,
                "player_focus": pt_player,
            },
            "de": {
                "headline": f"{actor} Durchbricht den Abwehrriegel",
                "analyst": de_analyst,
                "casual": de_casual,
                "player_focus": de_player,
            },
        }

        return PersonaOutputs(
            analyst=en_analyst,
            casual=en_casual,
            player_focus=en_player,
            player_cam_target_id=event.actor_id,
            translations=translations,
        )

    async def route(
        self,
        verified_narrative: str,
        event: RawMatchEvent,
        metrics: ComputedMetrics,
        trigger_reason: Optional[str],
    ) -> PersonaOutputs:
        """Route verified insight to 3 viewing personas and 3 languages."""
        fallback = self._generate_fallback_personas(
            verified_narrative, event, metrics, trigger_reason
        )

        if not self.llm.is_available:
            return fallback

        system_prompt = (
            "You are the multilingual Premier League broadcast personalization engine. "
            "Given a verified football moment, rewrite it for 3 viewer personas: "
            "1. analyst (tactical, half-spaces, xT, passing angles), "
            "2. casual (electric energy, excitement, jargon-free), "
            "3. player_focus (focusing on #8 Marcus Vance's positioning, stamina, decisions). "
            "Output JSON with exact structure: "
            '{"en": {"analyst": "...", "casual": "...", "player_focus": "...", "headline": "..."}, '
            '"es": {"analyst": "...", "casual": "...", "player_focus": "...", "headline": "..."}, '
            '"ar": {"analyst": "...", "casual": "...", "player_focus": "...", "headline": "..."}}'
        )

        user_prompt = (
            f"Verified Narrative: {verified_narrative}\n"
            f"Actor: {event.actor_name} (#{event.actor_number}, {event.team})\n"
            f"Metrics: +{metrics.xt_delta} xT, {event.defenders_bypassed} defenders bypassed, "
            f"{event.ball_speed_kmh} km/h, {metrics.pressure_index}% pressure."
        )

        res = await self.llm.complete_json(system_prompt, user_prompt)
        if res and "en" in res and "es" in res and "ar" in res:
            try:
                en_data = res["en"]
                return PersonaOutputs(
                    analyst=str(en_data.get("analyst", fallback.analyst)),
                    casual=str(en_data.get("casual", fallback.casual)),
                    player_focus=str(en_data.get("player_focus", fallback.player_focus)),
                    translations=res,  # type: ignore
                )
            except Exception as e:
                logger.warning(f"Persona parsing exception: {e}; using verified fallback.")

        return fallback
