"""Agent 3: Persona & Cultural Broadcast Localization Router.

Transforms verified tactical insights into 3 distinct viewing modes:
- Tactical Analyst (compactness, half-spaces, ΔxT, Pass Difficulty, spatial shape)
- Casual Fan (momentum, energy, excitement, crowd narrative)
- Player-Cam Focus (dedicated telemetry tracking for the active star player)
Across 7 culturally adapted broadcast dialects:
- English (EN): UK Premier League Studio Punditry (Sky MNF style)
- Spanish (ES): LaLiga / Sudamérica Radio & TV Táctica
- Arabic (AR): MENA Studio Poetic & Tactical Broadcast (beIN style)
- Korean (KO): K-League / Premier League Dynamic Studio (SPOTV style)
- French (FR): Canal+ / Ligue 1 Analytical Broadcast
- Portuguese (PT): Brasileirão / Lusophone Expressive Tactics
- German (DE): Bundesliga Taktik-Feed (Halbraum & Gegenpressing)
"""

from __future__ import annotations

import logging
import math
from typing import Dict, Optional
from app.agents.llm import llm_client
from app.models.schemas import ComputedMetrics, PersonaOutputs, RawMatchEvent

logger = logging.getLogger("pitchpulse.persona")


class PersonaRouter:
    """Agent 3: Audience Persona & Cultural Broadcast Idiom Router."""

    def __init__(self) -> None:
        self.llm = llm_client

    def _generate_fallback_personas(
        self,
        verified_narrative: str,
        event: RawMatchEvent,
        metrics: ComputedMetrics,
        trigger_reason: Optional[str],
    ) -> PersonaOutputs:
        """Event-specific, culturally adapted broadcast translations across 3 personas and 7 languages."""
        actor = event.actor_name
        target = event.target_name or "the attacking runner"
        bypassed = event.defenders_bypassed
        xt = metrics.xt_delta
        xt_str = f"+{xt:.2f}" if xt >= 0 else f"{xt:.2f}"
        spd = round(event.ball_speed_kmh, 0)
        pres = round(metrics.pressure_index, 0)
        diff = round(metrics.pass_difficulty_score, 0)
        chaos = round(metrics.control_chaos_index, 0)
        dist = round(math.hypot(event.end_x - event.start_x, event.end_y - event.start_y), 1)

        if trigger_reason == "high_press_turnover":
            translations: Dict[str, Dict[str, str]] = {
                "en": {
                    "headline": f"{actor} Triggers High-Press Counter Trap",
                    "analyst": (
                        f"UK Studio Analysis: {actor} springs the counter-press at {event.start_x:.0f}m under {pres:.0f}% pressure, "
                        f"forcing an immediate vertical transition worth {xt_str} xT before the defensive block can reset."
                    ),
                    "casual": (
                        f"Relentless hunting from {actor}! Steps in high up the pitch to rob possession and "
                        f"launch an electric counter-attack!"
                    ),
                    "player_focus": (
                        f"Player Cam ({actor}): Explosive defensive anticipation at {event.start_x:.0f}m. "
                        f"Sustains {pres:.0f}% pressure intensity and instantly flips defense into attack at {spd:.0f} km/h."
                    ),
                },
                "es": {
                    "headline": f"¡{actor} Activa la Trampa de Presión Alta!",
                    "analyst": (
                        f"Pizarra Táctica: {actor} muerde en zona de gestación ({event.start_x:.0f}m) con {pres:.0f}% de presión, "
                        f"provocando pérdida rival y activando una transición vertical de {xt_str} xT."
                    ),
                    "casual": (
                        f"¡Qué robo monumental de {actor}! Asfixia la salida rival en campo contrario y "
                        f"desata un contragolpe letal!"
                    ),
                    "player_focus": (
                        f"Cámara Jugador ({actor}): Lectura anticipativa de élite en {event.start_x:.0f}m. "
                        f"Recupera y lanza el balón a {spd:.0f} km/h sin dar respiro."
                    ),
                },
                "ar": {
                    "headline": f"{actor} يفعل مصيدة الضغط العالي والهجوم المرتد",
                    "analyst": (
                        f"الاستوديو التحليلي: {actor} يطبق الضغط العكسي عند النقطة {event.start_x:.0f}م بضغط {pres:.0f}%، "
                        f"مما أجبر المنافس على فقدان الكرة وصنع تحولاً هجومياً بقيمة {xt_str} xT."
                    ),
                    "casual": (
                        f"افتكاك رائع للكرة! {actor} يخنق دفاع المنافس في مناطقه ويشعل هجمة مرتدة خاطفة!"
                    ),
                    "player_focus": (
                        f"كاميرا النجم ({actor}): قراءة دفاعية استباقية عند {event.start_x:.0f}م وتحول فوري بسرعة {spd:.0f} كم/س."
                    ),
                },
                "ko": {
                    "headline": f"{actor}, 전방 압박 트랩 가동 및 역습 전환",
                    "analyst": (
                        f"전술 보드: {actor} 선수가 {event.start_x:.0f}m 지점에서 {pres:.0f}% 압박 강도로 게겐프레싱을 성공시키며 "
                        f"{xt_str} xT 가치의 빠른 공수 전환을 이끌어냈습니다."
                    ),
                    "casual": (
                        f"숨 막히는 전방 압박! {actor} 선수가 상대 진영에서 공을 가로채며 단숨에 역습 찬스를 만듭니다!"
                    ),
                    "player_focus": (
                        f"플레이어 캠 ({actor}): {event.start_x:.0f}m 지점에서의 날카로운 예측 인터셉트 후 {spd:.0f} km/h 전개."
                    ),
                },
                "fr": {
                    "headline": f"{actor} Déclenche le Piège du Contre-Pressing",
                    "analyst": (
                        f"Palette Tactique : {actor} harcèle le porteur à {event.start_x:.0f}m ({pres:.0f}% de pressing) "
                        f"et projette immédiatement le bloc avec un gain de {xt_str} xT."
                    ),
                    "casual": (
                        f"Quelle récupération haute de {actor} ! Il étouffe la relance adverse et lance un contre fulgurant !"
                    ),
                    "player_focus": (
                        f"Caméra Iso ({actor}) : Anticipation chirurgicale à {event.start_x:.0f}m et relance à {spd:.0f} km/h."
                    ),
                },
                "pt": {
                    "headline": f"{actor} Aciona a Armadilha de Pressão Alta",
                    "analyst": (
                        f"Mesa Tática: {actor} executa o perde-pressiona aos {event.start_x:.0f}m sob {pres:.0f}% de pressão, "
                        f"gerando transição ofensiva imediata de {xt_str} xT."
                    ),
                    "casual": (
                        f"Ladrão de casaca! {actor} rouba a bola no ataque e puxa um contra-ataque mortal!"
                    ),
                    "player_focus": (
                        f"Câmera Exclusiva ({actor}): Bote perfeito aos {event.start_x:.0f}m e passe rápido a {spd:.0f} km/h."
                    ),
                },
                "de": {
                    "headline": f"{actor} Zündet die Gegenpressing-Falle",
                    "analyst": (
                        f"Taktik-Feed: {actor} erzwingt per Parade-Gegenpressing bei {event.start_x:.0f}m ({pres:.0f}% Druck) "
                        f"den Ballgewinn und öffnet einen {xt_str} xT Umschaltmoment."
                    ),
                    "casual": (
                        f"Überragendes Gegenpressing von {actor}! Ballgewinn tief in der gegnerischen Hälfte und sofortiger Turbo!"
                    ),
                    "player_focus": (
                        f"Spieler-Fokus ({actor}): Aggressives Anlaufen bei {event.start_x:.0f}m und Direktspiel mit {spd:.0f} km/h."
                    ),
                },
            }
        elif trigger_reason == "chaos_surge":
            translations = {
                "en": {
                    "headline": f"Tactical Chaos Spikes to {chaos:.0f}/100 as Structure Breaks",
                    "analyst": (
                        f"UK Studio Analysis: Rapid turnovers drive the Control-Chaos Index to {chaos:.0f}/100. "
                        f"Compactness fractures as {actor} forces a {dist:.0f}m transition at {spd:.0f} km/h ({xt_str} xT)."
                    ),
                    "casual": (
                        f"End-to-end basketball football right now! Both midfields are wide open and {actor} "
                        f"is charging straight into the storm!"
                    ),
                    "player_focus": (
                        f"Player Cam ({actor}): Thriving in transitional chaos ({chaos:.0f}/100). "
                        f"Drives {dist:.0f}m vertically under {pres:.0f}% pressure to exploit the broken block."
                    ),
                },
                "es": {
                    "headline": f"¡El Índice de Caos Se Dispara a {chaos:.0f}/100!",
                    "analyst": (
                        f"Pizarra Táctica: El partido se rompe con un Índice de Caos de {chaos:.0f}/100. "
                        f"{actor} aproveita el desorden estructural con un envío de {dist:.0f}m ({xt_str} xT)."
                    ),
                    "casual": (
                        f"¡Partido de ida y vuelta total! ¡No hay mediocampo, puro vértigo con {actor} al mando!"
                    ),
                    "player_focus": (
                        f"Cámara Jugador ({actor}): Dominio en pleno vértigo ({chaos:.0f}/100), avanzando {dist:.0f}m a {spd:.0f} km/h."
                    ),
                },
                "ar": {
                    "headline": f"مؤشر الفوضى التكتيكية يقفز إلى {chaos:.0f}/100",
                    "analyst": (
                        f"الاستوديو التحليلي: توالي التحولات يرفع مؤشر الفوضى إلى {chaos:.0f}/100، "
                        f"و{actor} يستغل تفكك الخطوط بتمريرة طولها {dist:.0f}م ({xt_str} xT)."
                    ),
                    "casual": (
                        f"جنون كروي مفتوح على المصراعين! إيقاع لاهث وتحولات سريعة يقودها {actor}!"
                    ),
                    "player_focus": (
                        f"كاميرا النجم ({actor}): تألق وسط الفوضى التكتيكية ({chaos:.0f}/100) وتمرير بسرعة {spd:.0f} كم/س."
                    ),
                },
                "ko": {
                    "headline": f"카오스 지수 {chaos:.0f}/100 급상승 · 공방전 돌입",
                    "analyst": (
                        f"전술 보드: 연속 턴오버로 카오스 지수가 {chaos:.0f}/100까지 치솟았습니다. "
                        f"{actor} 선수가 간격이 벌어진 틈을 타 {dist:.0f}m 전진 패스({xt_str} xT)를 찔러 넣습니다."
                    ),
                    "casual": (
                        f"숨 쉴 틈 없는 난타전입니다! 중원이 완전히 지워진 상황에서 {actor} 선수가 폭풍처럼 몰아칩니다!"
                    ),
                    "player_focus": (
                        f"플레이어 캠 ({actor}): 혼전 상황(카오스 {chaos:.0f}) 속에서도 {dist:.0f}m 전진 전개."
                    ),
                },
                "fr": {
                    "headline": f"L'Indice de Chaos Grimpe à {chaos:.0f}/100",
                    "analyst": (
                        f"Palette Tactique : Le bloc explose avec un Indice de Chaos à {chaos:.0f}/100. "
                        f"{actor} exploite le déséquilibre sur {dist:.0f}m ({xt_str} xT)."
                    ),
                    "casual": (
                        f"C'est du attaque-défense irrespirable ! Le match s'emballe complètement autour de {actor} !"
                    ),
                    "player_focus": (
                        f"Caméra Iso ({actor}) : Lucide dans le chaos ({chaos:.0f}/100), projection de {dist:.0f}m à {spd:.0f} km/h."
                    ),
                },
                "pt": {
                    "headline": f"Índice de Caos Dispara para {chaos:.0f}/100!",
                    "analyst": (
                        f"Mesa Tática: Jogo franco com Índice de Caos em {chaos:.0f}/100. "
                        f"{actor} explora o espaçamento defensivo em progressão de {dist:.0f}m ({xt_str} xT)."
                    ),
                    "casual": (
                        f"É lá e cá sem parar! O jogo virou pura trocação e {actor} acelera tudo!"
                    ),
                    "player_focus": (
                        f"Câmera Exclusiva ({actor}): Frieza no caos ({chaos:.0f}/100), conectando {dist:.0f}m a {spd:.0f} km/h."
                    ),
                },
                "de": {
                    "headline": f"Chaos-Index Eskaliert auf {chaos:.0f}/100",
                    "analyst": (
                        f"Taktik-Feed: Die Raumordnung löst sich auf (Chaos-Index {chaos:.0f}/100). "
                        f"{actor} nutzt die fehlende Restverteidigung über {dist:.0f}m ({xt_str} xT)."
                    ),
                    "casual": (
                        f"Völlig wildes Umschaltspiel jetzt! Offener Schlagabtausch und {actor} mittendrin!"
                    ),
                    "player_focus": (
                        f"Spieler-Fokus ({actor}): Behält im Chaos ({chaos:.0f}/100) den Überblick über {dist:.0f}m."
                    ),
                },
            }
        elif trigger_reason == "goal_threat":
            is_goal = event.event_type == "goal"
            translations = {
                "en": {
                    "headline": f"{actor} Unleashes {spd:.0f} km/h Clinical Finish!" if is_goal else f"{actor} Fires High-xT Strike ({xt_str} xT)",
                    "analyst": (
                        f"UK Studio Analysis: {actor} exploits the central box occupation to strike at {spd:.0f} km/h "
                        f"(Difficulty {diff:.0f}/99), generating a massive {xt_str} Expected Threat spike."
                    ),
                    "casual": (
                        f"BOOM! {actor} rifles an unstoppable {spd:.0f} km/h rocket into the corner! "
                        f"Absolute pandemonium in the stadium!"
                    ),
                    "player_focus": (
                        f"Player Cam ({actor}): Lethal separation in the penalty area ({event.nearest_defender_dist_m:.1f}m space). "
                        f"Executes a {spd:.0f} km/h strike with clinical composure."
                    ),
                },
                "es": {
                    "headline": f"¡Golazo Clínico de {actor} a {spd:.0f} km/h!" if is_goal else f"¡Remate Peligroso de {actor} ({xt_str} xT)!",
                    "analyst": (
                        f"Pizarra Táctica: {actor} ataca el intervalo central y define a {spd:.0f} km/h "
                        f"(Dificultad {diff:.0f}/99), disparando la amenaza esperada en {xt_str} xT."
                    ),
                    "casual": (
                        f"¡GOOOLAZO! ¡{actor} suelta un latigazo imparable a {spd:.0f} km/h directo a la red!"
                    ),
                    "player_focus": (
                        f"Cámara Jugador ({actor}): Desmarque letal en el área y definición quirúrgica a {spd:.0f} km/h."
                    ),
                },
                "ar": {
                    "headline": f"هدف عالمي حاسم من {actor} بسرعة {spd:.0f} كم/س!" if is_goal else f"تسديدة خطيرة من {actor} ({xt_str} xT)",
                    "analyst": (
                        f"الاستوديو التحليلي: {actor} يستثمر التفوق العددي داخل الصندوق ويطلق تسديدة بسرعة {spd:.0f} كم/س "
                        f"(صعوبة {diff:.0f}/99) محققاً قفزة خطورة قدرها {xt_str} xT."
                    ),
                    "casual": (
                        f"الله! قذيفة مدوية لا تصد ولا ترد من {actor} بسرعة {spd:.0f} كم/س تهز الشباك!"
                    ),
                    "player_focus": (
                        f"كاميرا النجم ({actor}): تمركز قاتل داخل المنطقة وإنهاء حاسم بسرعة {spd:.0f} كم/س."
                    ),
                },
                "ko": {
                    "headline": f"{actor}, {spd:.0f} km/h 전광석화 같은 결승골 폭발!" if is_goal else f"{actor}, 위협적인 슈팅 ({xt_str} xT)",
                    "analyst": (
                        f"전술 보드: {actor} 선수가 박스 중앙 공간을 공략하며 {spd:.0f} km/h 슈팅(난이도 {diff:.0f}/99)으로 "
                        f"{xt_str} xT의 결정적 기대 위협을 완성했습니다."
                    ),
                    "casual": (
                        f"골망을 찢어버립니다! {actor} 선수의 {spd:.0f} km/h 대포알 슈팅이 그대로 꽂힙니다!"
                    ),
                    "player_focus": (
                        f"플레이어 캠 ({actor}): 수비와 {event.nearest_defender_dist_m:.1f}m 간격을 벌린 뒤 {spd:.0f} km/h 완벽 피니시."
                    ),
                },
                "fr": {
                    "headline": f"Finition Chirurgicale de {actor} à {spd:.0f} km/h !" if is_goal else f"Frappe Lourde de {actor} ({xt_str} xT)",
                    "analyst": (
                        f"Palette Tactique : {actor} sanctionne l'espace axial avec une frappe à {spd:.0f} km/h "
                        f"(Difficulté {diff:.0f}/99), générant un pic de {xt_str} xT."
                    ),
                    "casual": (
                        f"Quel missile de {actor} ! Flashé à {spd:.0f} km/h en pleine lucarne, le stade chavire !"
                    ),
                    "player_focus": (
                        f"Caméra Iso ({actor}) : Appel tranchant dans la surface et frappe pure à {spd:.0f} km/h."
                    ),
                },
                "pt": {
                    "headline": f"Golaço Fatal de {actor} a {spd:.0f} km/h!" if is_goal else f"Finalização Perigosa de {actor} ({xt_str} xT)",
                    "analyst": (
                        f"Mesa Tática: {actor} infiltra na zona central e finaliza a {spd:.0f} km/h "
                        f"(Dificuldade {diff:.0f}/99), elevando o xT em {xt_str}."
                    ),
                    "casual": (
                        f"CAIXA! {actor} solta uma bomba de {spd:.0f} km/h no cantinho sem chance para o goleiro!"
                    ),
                    "player_focus": (
                        f"Câmera Exclusiva ({actor}): Frieza cirúrgica na área para fuzilar a {spd:.0f} km/h."
                    ),
                },
                "de": {
                    "headline": f"Eiskalter Abschluss von {actor} mit {spd:.0f} km/h!" if is_goal else f"Gefährlicher Abschluss von {actor} ({xt_str} xT)",
                    "analyst": (
                        f"Taktik-Feed: {actor} nutzt die Box-Besetzung für einen {spd:.0f} km/h Abschluss "
                        f"(Schwierigkeit {diff:.0f}/99) mit einem Expected-Threat-Wert von {xt_str} xT."
                    ),
                    "casual": (
                        f"TOR! {actor} hämmert den Ball mit {spd:.0f} km/h unhaltbar ins Eck!"
                    ),
                    "player_focus": (
                        f"Spieler-Fokus ({actor}): Perfektes Timing im Strafraum und Vollstreckung mit {spd:.0f} km/h."
                    ),
                },
            }
        elif trigger_reason == "sprint_alert":
            sprinter = next((p for p in event.players_snapshot if p.speed_kmh >= 30.0), None)
            s_name = sprinter.name if sprinter else actor
            s_spd = sprinter.speed_kmh if sprinter else max(31.2, event.ball_speed_kmh)
            translations = {
                "en": {
                    "headline": f"{s_name} Clocks {s_spd:.1f} km/h Breakaway Sprint",
                    "analyst": (
                        f"UK Studio Analysis: {s_name} hits a peak velocity of {s_spd:.1f} km/h in the wide channel, "
                        f"stretching the opposition backline vertically and creating a {xt_str} xT outlet."
                    ),
                    "casual": (
                        f"Pure afterburners from {s_name}! Clocked at {s_spd:.1f} km/h leaving defenders in the dust!"
                    ),
                    "player_focus": (
                        f"Player Cam ({s_name}): Peak physical burst at {s_spd:.1f} km/h, forcing the entire defensive line to drop 12m."
                    ),
                },
                "es": {
                    "headline": f"¡Sprint Explosivo de {s_name} a {s_spd:.1f} km/h!",
                    "analyst": (
                        f"Pizarra Táctica: {s_name} alcanza {s_spd:.1f} km/h al espacio, rompiendo la línea de fuera de juego "
                        f"y generando {xt_str} xT en amplitud."
                    ),
                    "casual": (
                        f"¡Una locomotora llamada {s_name}! ¡Vuela a {s_spd:.1f} km/h por la banda!"
                    ),
                    "player_focus": (
                        f"Cámara Jugador ({s_name}): Potencia física de élite alcanzando {s_spd:.1f} km/h en transición."
                    ),
                },
                "ar": {
                    "headline": f"انطلاقة صاروخية من {s_name} بسرعة {s_spd:.1f} كم/س",
                    "analyst": (
                        f"الاستوديو التحليلي: {s_name} يسجل سرعة قصوى تبلغ {s_spd:.1f} كم/س، موسعاً المساحات الطولية بقيمة {xt_str} xT."
                    ),
                    "casual": (
                        f"سرعة خيالية من {s_name}! ينطلق كالسهم بسرعة {s_spd:.1f} كم/س متفوقاً على الجميع!"
                    ),
                    "player_focus": (
                        f"كاميرا النجم ({s_name}): انفجار بدني مذهل بسرعة {s_spd:.1f} كم/س يربك الحسابات الدفاعية."
                    ),
                },
                "ko": {
                    "headline": f"{s_name}, {s_spd:.1f} km/h 폭발적 스프린트 돌파",
                    "analyst": (
                        f"전술 보드: {s_name} 선수가 최고 속도 {s_spd:.1f} km/h를 기록하며 수비 뒷공간을 완전히 허물고 {xt_str} xT를 창출합니다."
                    ),
                    "casual": (
                        f"엄청난 스피드입니다! {s_name} 선수가 {s_spd:.1f} km/h로 측면을 완전히 지배합니다!"
                    ),
                    "player_focus": (
                        f"플레이어 캠 ({s_name}): {s_spd:.1f} km/h 초고속 질주로 상대 수비 라인을 무너뜨립니다."
                    ),
                },
                "fr": {
                    "headline": f"Flashé à {s_spd:.1f} km/h : Le Sprint de {s_name}",
                    "analyst": (
                        f"Palette Tactique : {s_name} atteint {s_spd:.1f} km/h dans le couloir, étirant le bloc adverse ({xt_str} xT)."
                    ),
                    "casual": (
                        f"Quelle fusée ! {s_name} dépose tout le monde avec une pointe à {s_spd:.1f} km/h !"
                    ),
                    "player_focus": (
                        f"Caméra Iso ({s_name}) : Pic de vitesse à {s_spd:.1f} km/h pour attaquer la profondeur."
                    ),
                },
                "pt": {
                    "headline": f"Arrancada Fulminante de {s_name} a {s_spd:.1f} km/h!",
                    "analyst": (
                        f"Mesa Tática: {s_name} atinge {s_spd:.1f} km/h atacando o espaço nas costas da zaga ({xt_str} xT)."
                    ),
                    "casual": (
                        f"Botou na frente e tchau! {s_name} voa baixo a {s_spd:.1f} km/h!"
                    ),
                    "player_focus": (
                        f"Câmera Exclusiva ({s_name}): Explosão muscular atingindo {s_spd:.1f} km/h no corredor."
                    ),
                },
                "de": {
                    "headline": f"Highspeed-Sprint: {s_name} mit {s_spd:.1f} km/h gemessen",
                    "analyst": (
                        f"Taktik-Feed: {s_name} erreicht {s_spd:.1f} km/h in der Tiefe und sprengt die letzte Kette ({xt_str} xT)."
                    ),
                    "casual": (
                        f"Wahnsinns-Tempo von {s_name}! Mit {s_spd:.1f} km/h zieht er allen davon!"
                    ),
                    "player_focus": (
                        f"Spieler-Fokus ({s_name}): Top-Speed von {s_spd:.1f} km/h zwingt die Abwehr zum Rückzug."
                    ),
                },
            }
        else:
            # Default: line_breaking_pass
            translations = {
                "en": {
                    "headline": f"{actor} Threads {dist:.0f}m Line-Breaker ({diff:.0f}/99 Difficulty)",
                    "analyst": (
                        f"UK Studio Analysis: {actor} dissects the midfield block in the half-space, bypassing {bypassed} defenders "
                        f"over {dist:.1f}m under {pres:.0f}% pressure (Difficulty {diff:.0f}/99) to unlock a {xt_str} xT corridor."
                    ),
                    "casual": (
                        f"What vision from {actor}! Threads the needle past {bypassed} defenders with ice in their veins "
                        f"to set {target} free!"
                    ),
                    "player_focus": (
                        f"Player Cam ({actor}): Elite playmaking under {pres:.0f}% pressure. "
                        f"Distributes {dist:.1f}m at {spd:.0f} km/h (Difficulty {diff:.0f}/99) to dictate tempo."
                    ),
                },
                "es": {
                    "headline": f"{actor} Filtra Pase Rompelíneas de {dist:.0f}m (Dif. {diff:.0f}/99)",
                    "analyst": (
                        f"Pizarra Táctica: {actor} rompe líneas en el pasillo interior ({dist:.1f}m), superando a {bypassed} rivales "
                        f"bajo {pres:.0f}% de presión (Dificultad {diff:.0f}/99) para generar {xt_str} xT."
                    ),
                    "casual": (
                        f"¡Pase quirúrgico de {actor}! Deja atrás a {bypassed} defensores con pura magia para habilitar a {target}!"
                    ),
                    "player_focus": (
                        f"Cámara Jugador ({actor}): Control total bajo {pres:.0f}% de presión, enviando un pase de {dist:.1f}m a {spd:.0f} km/h."
                    ),
                },
                "ar": {
                    "headline": f"{actor} يرسل تمريرة كاسرة للخطوط ({dist:.0f}م · صعوبة {diff:.0f}/99)",
                    "analyst": (
                        f"الاستوديو التحليلي: {actor} يخترق خطوط الوسط في نصف المساحة لمسافة {dist:.1f}م، متجاوزاً {bypassed} مدافعين "
                        f"تحت ضغط {pres:.0f}% (درجة الصعوبة {diff:.0f}/99) ليصنع {xt_str} xT."
                    ),
                    "casual": (
                        f"رؤية ساحرة من {actor}! تمريرة بالمقاس تضرب {bypassed} مدافعين وتضع الهجوم في موقف مثالي!"
                    ),
                    "player_focus": (
                        f"كاميرا النجم ({actor}): دقة استثنائية تحت ضغط {pres:.0f}%، وتمريرة طولها {dist:.1f}م بسرعة {spd:.0f} كم/س."
                    ),
                },
                "ko": {
                    "headline": f"{actor}, {dist:.0f}m 라인 브레이킹 패스 (난이도 {diff:.0f}/99)",
                    "analyst": (
                        f"전술 보드: {actor} 선수가 하프스페이스에서 {pres:.0f}% 압박을 이겨내며 {bypassed}명의 수비를 제치는 "
                        f"{dist:.1f}m 패스(난이도 {diff:.0f}/99)로 {xt_str} xT를 창출했습니다."
                    ),
                    "casual": (
                        f"소름 돋는 시야! {actor} 선수가 수비수 {bypassed}명을 한 번에 지워버리는 완벽한 침투 패스를 찔러줍니다!"
                    ),
                    "player_focus": (
                        f"플레이어 캠 ({actor}): {pres:.0f}% 압박 속에서도 {spd:.0f} km/h 속도로 {dist:.1f}m 킬패스 공급."
                    ),
                },
                "fr": {
                    "headline": f"{actor} Casse les Lignes sur {dist:.0f}m (Diff. {diff:.0f}/99)",
                    "analyst": (
                        f"Palette Tactique : {actor} trouve l'intervalle dans le demi-espace sur {dist:.1f}m, éliminant {bypassed} défenseurs "
                        f"sous {pres:.0f}% de pressing (Difficulté {diff:.0f}/99) pour {xt_str} xT."
                    ),
                    "casual": (
                        f"Quelle inspiration de {actor} ! Une passe laser qui efface {bypassed} adversaires d'un seul coup !"
                    ),
                    "player_focus": (
                        f"Caméra Iso ({actor}) : Sang-froid sous {pres:.0f}% de pression, transmission de {dist:.1f}m à {spd:.0f} km/h."
                    ),
                },
                "pt": {
                    "headline": f"{actor} Quebra Linhas em {dist:.0f}m (Dif. {diff:.0f}/99)",
                    "analyst": (
                        f"Mesa Tática: {actor} rompe o bloco no meio-espaço por {dist:.1f}m, superando {bypassed} marcadores "
                        f"sob {pres:.0f}% de pressão (Dificuldade {diff:.0f}/99) para gerar {xt_str} xT."
                    ),
                    "casual": (
                        f"Que pifada espetacular de {actor}! Rasga a defesa deixando {bypassed} marcadores para trás!"
                    ),
                    "player_focus": (
                        f"Câmera Exclusiva ({actor}): Visão de raio-X sob {pres:.0f}% de pressão, passe de {dist:.1f}m a {spd:.0f} km/h."
                    ),
                },
                "de": {
                    "headline": f"{actor} Spielt {dist:.0f}m Linienbrecher (Schwierigkeit {diff:.0f}/99)",
                    "analyst": (
                        f"Taktik-Feed: {actor} bespielt den Halbraum über {dist:.1f}m, überspielt {bypassed} Gegner "
                        f"unter {pres:.0f}% Druck (Schwierigkeit {diff:.0f}/99) für {xt_str} xT."
                    ),
                    "casual": (
                        f"Was für ein Schnittstellenpass von {actor}! Nimmt mit einem Kontakt {bypassed} Verteidiger aus dem Spiel!"
                    ),
                    "player_focus": (
                        f"Spieler-Fokus ({actor}): Höchste Präzision unter {pres:.0f}% Gegnerdruck über {dist:.1f}m ({spd:.0f} km/h)."
                    ),
                },
            }

        en_pack = translations["en"]
        return PersonaOutputs(
            analyst=en_pack["analyst"],
            casual=en_pack["casual"],
            player_focus=en_pack["player_focus"],
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
        """Route verified insight to 3 viewing personas and 7 culturally adapted broadcast dialects."""
        fallback = self._generate_fallback_personas(
            verified_narrative, event, metrics, trigger_reason
        )

        if not self.llm.is_available:
            return fallback

        dist = round(math.hypot(event.end_x - event.start_x, event.end_y - event.start_y), 1)
        system_prompt = (
            "You are the Premier League Cultural Broadcast & Persona Adaptation Engine. "
            "Instead of literal word-for-word translation, adapt the verified match intelligence into authentic regional "
            "football broadcast idioms across 7 languages (en: UK Sky MNF, es: LaLiga/Sudamérica radio, ar: MENA studio, "
            "ko: SPOTV Korea, fr: Canal+ France, pt: Brasileirão Globo, de: Bundesliga Taktik-Feed) and 3 viewer personas: "
            "1. analyst (tactical structure, half-spaces, ΔxT, pass difficulty, spatial geometry), "
            "2. casual (stadium emotion, narrative stakes, jargon-free energy), "
            "3. player_focus (dedicated spotlight on the actor's decision-making, pressure resistance, and physical telemetry). "
            "Preserve all verified numbers exactly. Output JSON with keys 'en', 'es', 'ar', 'ko', 'fr', 'pt', 'de', "
            "each containing {'headline', 'analyst', 'casual', 'player_focus'}."
        )

        user_prompt = (
            f"Verified Narrative: {verified_narrative}\n"
            f"Trigger Type: {trigger_reason}\n"
            f"Actor: {event.actor_name} (#{event.actor_number}, {event.team})\n"
            f"Metrics: ΔxT={metrics.xt_delta:+.2f}, Pass Difficulty={metrics.pass_difficulty_score:.0f}/99, "
            f"Distance={dist:.1f}m, Bypassed={event.defenders_bypassed} defenders, "
            f"Speed={event.ball_speed_kmh:.0f} km/h, Pressure={metrics.pressure_index:.0f}%, Chaos={metrics.control_chaos_index:.0f}/100."
        )

        res = await self.llm.complete_json(system_prompt, user_prompt)
        if res and isinstance(res, dict) and "en" in res:
            try:
                merged_translations = dict(fallback.translations)
                for lang_code in ("en", "es", "ar", "ko", "fr", "pt", "de"):
                    if lang_code in res and isinstance(res[lang_code], dict):
                        merged_translations[lang_code] = {
                            "headline": str(res[lang_code].get("headline", fallback.translations[lang_code]["headline"])),
                            "analyst": str(res[lang_code].get("analyst", fallback.translations[lang_code]["analyst"])),
                            "casual": str(res[lang_code].get("casual", fallback.translations[lang_code]["casual"])),
                            "player_focus": str(res[lang_code].get("player_focus", fallback.translations[lang_code]["player_focus"])),
                        }

                en_data = merged_translations["en"]
                return PersonaOutputs(
                    analyst=en_data["analyst"],
                    casual=en_data["casual"],
                    player_focus=en_data["player_focus"],
                    player_cam_target_id=event.actor_id,
                    translations=merged_translations,
                )
            except Exception as e:
                logger.warning(f"Persona parsing exception: {e}; using verified fallback.")

        return fallback
