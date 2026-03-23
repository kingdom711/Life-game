/**
 * AI 시나리오 시뮬레이션 데이터
 * 분기형 안전 시나리오 5종
 * 카테고리: fall(추락), electric(전기), fire(화재), chemical(화학), general(일반)
 */

export const SCENARIOS = [
  // ===== 시나리오 1: 비 오는 날 고소작업 =====
  {
    id: 'scenario_rain_elevated',
    title: '비 오는 날 고소작업',
    description: '갑자기 비가 내리기 시작한 고소작업 현장에서 올바른 판단을 내려야 합니다. 작업 중지, 안전장비, 보고 절차를 확인하세요.',
    icon: '🌧️',
    difficulty: 'easy',
    category: 'fall',
    reward: { points: 150, exp: 40 },
    steps: [
      {
        id: 'rain_step1',
        situation: '당신은 지상 15m 높이의 비계 위에서 외벽 도장 작업을 하고 있습니다. 갑자기 하늘이 어두워지며 빗방울이 떨어지기 시작합니다. 발판이 조금씩 미끄러워지고 있으며, 동료 2명도 함께 작업 중입니다.',
        image: '🏗️',
        choices: [
          {
            id: 'rain_c1_1',
            text: '비가 조금이니 작업을 계속한다. 빨리 끝내고 내려가자.',
            isCorrect: false,
            feedback: '❌ 잘못된 판단입니다. 고소작업 시 우천 시에는 즉시 작업을 중지해야 합니다. 미끄러운 발판은 추락사고의 주요 원인입니다. 산업안전보건법에 따라 강풍, 폭우 등 악천후 시 고소작업은 금지됩니다.',
            points: 0,
            nextStepId: 'rain_step2'
          },
          {
            id: 'rain_c1_2',
            text: '즉시 작업을 중지하고 동료들에게 알린 후, 안전하게 하강을 준비한다.',
            isCorrect: true,
            feedback: '✅ 정확합니다! 고소작업 중 우천 시에는 즉시 작업을 중단해야 합니다. 안전보건규칙 제37조에 따라 비, 눈, 바람 등으로 위험이 예상될 때는 작업을 중지해야 합니다.',
            points: 50,
            nextStepId: 'rain_step2'
          },
          {
            id: 'rain_c1_3',
            text: '비가 그칠 때까지 비계 위에서 대기한다.',
            isCorrect: false,
            feedback: '⚠️ 부적절합니다. 비계 위에서 대기하는 것은 위험합니다. 번개가 칠 수 있고, 비계가 미끄러워져 추락 위험이 있습니다. 즉시 안전한 장소로 이동해야 합니다.',
            points: 10,
            nextStepId: 'rain_step2'
          }
        ]
      },
      {
        id: 'rain_step2',
        situation: '작업 중지를 결정하고 하강을 시작합니다. 사다리와 비계 발판이 이미 젖어 미끄러운 상태입니다. 안전장비를 어떻게 활용해야 할까요?',
        image: '🪜',
        choices: [
          {
            id: 'rain_c2_1',
            text: '안전대(하네스)를 확실히 체결하고, 3점 접촉법으로 천천히 하강한다.',
            isCorrect: true,
            feedback: '✅ 올바른 판단입니다! 안전대를 확실히 체결하고 3점 접촉법(두 손 한 발 또는 한 손 두 발)을 유지하며 하강하는 것이 가장 안전합니다. 서두르지 말고 한 발씩 확인하며 이동하세요.',
            points: 50,
            nextStepId: 'rain_step3'
          },
          {
            id: 'rain_c2_2',
            text: '빨리 내려가야 하니 안전대를 풀고 신속하게 사다리를 타고 내려간다.',
            isCorrect: false,
            feedback: '❌ 매우 위험합니다! 미끄러운 상황에서 안전대를 해제하면 추락 시 보호받을 수 없습니다. 안전대는 하강이 완료될 때까지 절대 해제하면 안 됩니다.',
            points: 0,
            nextStepId: 'rain_step3'
          },
          {
            id: 'rain_c2_3',
            text: '안전대를 착용한 채 가장 가까운 구조물을 잡고 미끄러지듯 빠르게 내려간다.',
            isCorrect: false,
            feedback: '⚠️ 안전대 착용은 좋지만, 미끄러지듯 내려가는 것은 통제력을 잃을 수 있어 위험합니다. 반드시 3점 접촉법으로 천천히 하강해야 합니다.',
            points: 20,
            nextStepId: 'rain_step3'
          }
        ]
      },
      {
        id: 'rain_step3',
        situation: '무사히 지상으로 내려왔습니다. 동료들도 모두 안전하게 하강을 완료했습니다. 이제 어떤 조치를 취해야 할까요?',
        image: '📋',
        choices: [
          {
            id: 'rain_c3_1',
            text: '현장 관리감독자에게 작업 중지 사실을 보고하고, 작업중지 보고서를 작성한다.',
            isCorrect: true,
            feedback: '✅ 완벽합니다! 악천후로 인한 작업 중지 시 반드시 관리감독자에게 보고하고 공식 기록을 남겨야 합니다. 재개 시점은 안전관리자와 협의하여 결정합니다.',
            points: 50,
            nextStepId: 'end'
          },
          {
            id: 'rain_c3_2',
            text: '비가 그치면 알아서 다시 올라가서 작업을 재개한다.',
            isCorrect: false,
            feedback: '❌ 임의로 작업을 재개하면 안 됩니다. 비가 그친 후에도 발판이 마를 때까지 시간이 필요하며, 안전관리자의 확인 후 작업 재개 여부를 결정해야 합니다.',
            points: 0,
            nextStepId: 'end'
          },
          {
            id: 'rain_c3_3',
            text: '동료들에게만 말하고 별도 보고 없이 대기한다.',
            isCorrect: false,
            feedback: '⚠️ 작업 중지 사실은 반드시 공식 채널을 통해 보고해야 합니다. 관리감독자에게 보고하지 않으면 안전관리 체계가 작동하지 않으며, 안전보건 기록 관리에도 문제가 생깁니다.',
            points: 10,
            nextStepId: 'end'
          }
        ]
      }
    ]
  },

  // ===== 시나리오 2: 전기실 이상 발견 =====
  {
    id: 'scenario_electric_anomaly',
    title: '전기실 이상 발견',
    description: '전기실 순찰 중 이상 징후를 발견했습니다. 스파크, 이상 냄새, 과열 상황에서 정확한 대응 절차를 따르세요.',
    icon: '⚡',
    difficulty: 'medium',
    category: 'electric',
    reward: { points: 200, exp: 55 },
    steps: [
      {
        id: 'elec_step1',
        situation: '전기실 정기 순찰 중 고압 배전반에서 "치직" 하는 스파크 소리와 함께 타는 듯한 냄새가 납니다. 배전반 표면 온도계를 확인하니 정상 범위를 초과하고 있습니다. 현재 전기실에는 당신 혼자입니다.',
        image: '⚡',
        choices: [
          {
            id: 'elec_c1_1',
            text: '직접 배전반을 열어 내부 상태를 확인한다.',
            isCorrect: false,
            feedback: '❌ 매우 위험합니다! 스파크가 발생하고 있는 고압 배전반을 임의로 개방하면 감전 또는 아크 플래시 사고가 발생할 수 있습니다. 비인가자의 고압 설비 조작은 절대 금지입니다.',
            points: 0,
            nextStepId: 'elec_step2'
          },
          {
            id: 'elec_c1_2',
            text: '즉시 전기실에서 안전하게 대피하고, 관리감독자와 전기 담당자에게 긴급 연락한다.',
            isCorrect: true,
            feedback: '✅ 정확한 판단입니다! 스파크와 과열이 감지되면 즉시 안전한 거리를 확보하고, 자격이 있는 전기 담당자에게 연락해야 합니다. 직접 조치하려고 하면 감전, 화재, 폭발의 위험이 있습니다.',
            points: 70,
            nextStepId: 'elec_step2'
          },
          {
            id: 'elec_c1_3',
            text: '전기실 메인 차단기를 내린다.',
            isCorrect: false,
            feedback: '⚠️ 의도는 좋지만, 고압 설비의 차단 조작은 반드시 자격이 있는 전기 기술자만 수행해야 합니다. 잘못된 조작은 2차 사고를 유발할 수 있으며, 공장 전체에 영향을 줄 수 있습니다.',
            points: 20,
            nextStepId: 'elec_step2'
          }
        ]
      },
      {
        id: 'elec_step2',
        situation: '전기실에서 대피한 후 전기 담당자에게 연락했습니다. 담당자가 도착하기까지 약 10분이 걸린다고 합니다. 대기 중 전기실 문 쪽에서 연기가 보이기 시작합니다.',
        image: '🔥',
        choices: [
          {
            id: 'elec_c2_1',
            text: '즉시 화재 경보를 울리고, 소방서에 신고한 후, 주변 인원을 대피시킨다.',
            isCorrect: true,
            feedback: '✅ 올바른 대응입니다! 연기가 보이면 화재로 확대될 가능성이 높으므로 즉시 화재 경보를 발령하고, 119에 신고해야 합니다. 전기 화재이므로 물 소화기는 절대 사용하면 안 됩니다.',
            points: 70,
            nextStepId: 'elec_step3'
          },
          {
            id: 'elec_c2_2',
            text: '전기 담당자가 올 때까지 기다린다. 아직 연기만 나는 단계이다.',
            isCorrect: false,
            feedback: '❌ 연기가 발생한 시점에서 이미 화재가 진행 중일 수 있습니다. 전기 화재는 급속히 확대될 수 있으므로, 즉시 화재 대응 절차를 시작해야 합니다. 10분은 매우 긴 시간입니다.',
            points: 0,
            nextStepId: 'elec_step3'
          },
          {
            id: 'elec_c2_3',
            text: '물 소화기를 가져와서 진화를 시도한다.',
            isCorrect: false,
            feedback: '❌ 절대 안 됩니다! 전기 화재에 물 소화기를 사용하면 감전 사고가 발생합니다. 전기 화재에는 CO2 소화기 또는 ABC 분말 소화기를 사용해야 합니다. C등급 표시가 있는 소화기만 사용 가능합니다.',
            points: 0,
            nextStepId: 'elec_step3'
          }
        ]
      },
      {
        id: 'elec_step3',
        situation: '화재 경보를 울리고 대피를 진행했습니다. 소방대가 도착하기 전까지 추가 조치가 필요합니다. 어떤 조치를 취해야 할까요?',
        image: '🧯',
        choices: [
          {
            id: 'elec_c3_1',
            text: 'CO2 소화기로 초기 진화를 시도하되, 안전거리를 유지하고 대피로를 확보한다.',
            isCorrect: true,
            feedback: '✅ 훌륭합니다! CO2 소화기는 전기 화재에 적합하며, 안전거리를 유지하고 대피로를 확보한 상태에서 초기 진화를 시도하는 것이 올바른 대응입니다. 진화가 어려우면 즉시 대피하세요.',
            points: 60,
            nextStepId: 'end'
          },
          {
            id: 'elec_c3_2',
            text: '소방대가 올 때까지 아무것도 하지 않고 건물 밖에서 대기한다.',
            isCorrect: false,
            feedback: '⚠️ 안전한 대기는 좋지만, 초기 진화가 가능한 단계에서 적절한 소화기를 사용하면 피해를 최소화할 수 있습니다. 다만 무리한 진화 시도는 삼가야 합니다.',
            points: 30,
            nextStepId: 'end'
          },
          {
            id: 'elec_c3_3',
            text: '전기실로 다시 들어가 전원을 차단하려고 시도한다.',
            isCorrect: false,
            feedback: '❌ 연기와 화재가 발생한 전기실에 재진입하는 것은 극히 위험합니다. 유독가스 흡입, 감전, 화상 등의 위험이 있습니다. 전원 차단은 소방대 또는 전문 기술자가 안전 장비를 갖추고 수행해야 합니다.',
            points: 0,
            nextStepId: 'end'
          }
        ]
      }
    ]
  },

  // ===== 시나리오 3: 밀폐공간 작업 =====
  {
    id: 'scenario_confined_space',
    title: '밀폐공간 작업',
    description: '맨홀 내부 점검 작업을 위해 밀폐공간에 진입해야 합니다. 가스 측정, 감시인 배치, 환기 절차를 정확히 따르세요.',
    icon: '🕳️',
    difficulty: 'hard',
    category: 'general',
    reward: { points: 250, exp: 70 },
    steps: [
      {
        id: 'conf_step1',
        situation: '지하 맨홀 내부의 배관 점검 작업이 예정되어 있습니다. 맨홀 깊이는 약 5m이며, 최근 한 달간 개방된 적이 없습니다. 작업 전 어떤 절차를 먼저 수행해야 할까요?',
        image: '🔍',
        choices: [
          {
            id: 'conf_c1_1',
            text: '밀폐공간 작업 허가서를 발급받고, 가스 측정기로 산소 농도와 유해가스를 측정한다.',
            isCorrect: true,
            feedback: '✅ 완벽합니다! 밀폐공간 진입 전 반드시 작업허가서를 발급받고, 산소 농도(18~23.5%), 유해가스(황화수소, 일산화탄소 등), 가연성 가스를 측정해야 합니다. 이것은 산업안전보건법에서 규정한 필수 절차입니다.',
            points: 85,
            nextStepId: 'conf_step2'
          },
          {
            id: 'conf_c1_2',
            text: '뚜껑을 열고 환기를 30분 시킨 후 바로 내려간다.',
            isCorrect: false,
            feedback: '❌ 환기는 필요하지만, 가스 측정 없이 진입하는 것은 매우 위험합니다. 환기만으로 유해가스가 완전히 제거되었는지 확인할 수 없습니다. 반드시 가스 측정기로 확인 후 진입해야 합니다.',
            points: 15,
            nextStepId: 'conf_step2'
          },
          {
            id: 'conf_c1_3',
            text: '경험이 많으니 장갑과 마스크만 착용하고 빠르게 진입하여 점검한다.',
            isCorrect: false,
            feedback: '❌ 매우 위험한 행동입니다! 밀폐공간에서의 질식사고는 경험과 무관하게 발생합니다. 산소 결핍이나 유해가스는 감각으로 확인할 수 없으며, 수 초 만에 의식을 잃을 수 있습니다.',
            points: 0,
            nextStepId: 'conf_step2'
          }
        ]
      },
      {
        id: 'conf_step2',
        situation: '가스 측정 결과 산소 농도 20.9%, 유해가스 미검출로 안전한 상태입니다. 환기 장치를 가동한 후 진입을 준비합니다. 작업 인원을 어떻게 배치해야 할까요?',
        image: '👥',
        choices: [
          {
            id: 'conf_c2_1',
            text: '작업자 1명이 내부에서 작업하고, 감시인 1명이 맨홀 입구에서 상시 감시하며, 구조 장비를 준비해 둔다.',
            isCorrect: true,
            feedback: '✅ 정확합니다! 밀폐공간 작업 시 반드시 감시인(관찰자)을 배치해야 합니다. 감시인은 내부 작업자와 지속적으로 소통하며, 비상 시 즉시 구조를 요청할 수 있어야 합니다. 구조용 삼각대와 안전대도 필수입니다.',
            points: 85,
            nextStepId: 'conf_step3'
          },
          {
            id: 'conf_c2_2',
            text: '작업자 2명이 함께 내부에 진입하여 빠르게 작업을 마친다.',
            isCorrect: false,
            feedback: '❌ 감시인 없이 2명 모두 진입하면, 사고 발생 시 외부에서 도움을 요청할 사람이 없습니다. 실제로 밀폐공간 사고의 많은 사례가 구조하러 들어간 사람까지 사망하는 2차 사고입니다.',
            points: 0,
            nextStepId: 'conf_step3'
          },
          {
            id: 'conf_c2_3',
            text: '혼자 내부에 진입하되 무전기를 가지고 들어간다.',
            isCorrect: false,
            feedback: '⚠️ 무전기는 도움이 되지만, 감시인 배치는 법적 의무사항입니다. 의식을 잃으면 무전기를 사용할 수 없으며, 외부에서 지속적으로 상태를 확인하는 감시인이 반드시 필요합니다.',
            points: 10,
            nextStepId: 'conf_step3'
          }
        ]
      },
      {
        id: 'conf_step3',
        situation: '작업 중 감시인이 내부의 산소 농도가 18% 이하로 떨어지고 있다고 알립니다. 환기 장치가 갑자기 멈춘 것 같습니다. 이 상황에서 어떻게 해야 할까요?',
        image: '🚨',
        choices: [
          {
            id: 'conf_c3_1',
            text: '즉시 작업을 중단하고, 구조용 안전대를 이용해 신속하게 외부로 대피한다.',
            isCorrect: true,
            feedback: '✅ 올바른 판단입니다! 산소 농도가 18% 이하로 떨어지면 산소 결핍 상태로, 즉시 대피해야 합니다. 구조용 삼각대와 안전대를 이용해 신속하게 탈출하고, 환기 장치를 점검한 후 재진입 여부를 결정합니다.',
            points: 80,
            nextStepId: 'end'
          },
          {
            id: 'conf_c3_2',
            text: '환기 장치를 다시 가동시키기 위해 잠시 작업을 계속한다.',
            isCorrect: false,
            feedback: '❌ 산소 농도가 떨어지는 상황에서 작업을 계속하면 의식을 잃을 수 있습니다. 16% 이하에서는 수 분 내에 사망할 수 있습니다. 어떤 이유로든 즉시 대피가 우선입니다.',
            points: 0,
            nextStepId: 'end'
          },
          {
            id: 'conf_c3_3',
            text: '감시인에게 환기 장치를 고쳐달라고 요청하고 그 자리에서 대기한다.',
            isCorrect: false,
            feedback: '⚠️ 감시인이 환기 장치를 수리하는 동안 산소 농도가 더 떨어질 수 있습니다. 산소 부족 상태에서의 대기는 생명을 위협합니다. 먼저 대피한 후 외부에서 환기 조치를 취해야 합니다.',
            points: 10,
            nextStepId: 'end'
          }
        ]
      }
    ]
  },

  // ===== 시나리오 4: 지게차 후진 사고 예방 =====
  {
    id: 'scenario_forklift_reverse',
    title: '지게차 후진 사고 예방',
    description: '물류 창고에서 지게차 후진 작업 중 발생할 수 있는 사고를 예방하세요. 신호, 안전거리, 의사소통이 핵심입니다.',
    icon: '🚜',
    difficulty: 'medium',
    category: 'general',
    reward: { points: 180, exp: 50 },
    steps: [
      {
        id: 'fork_step1',
        situation: '물류 창고에서 지게차가 무거운 화물을 적재한 후 후진하려고 합니다. 주변에 보행자 통로가 있고, 작업자 몇 명이 근처에서 정리 작업을 하고 있습니다. 지게차 운전자로서 후진 전 어떻게 해야 할까요?',
        image: '🚜',
        choices: [
          {
            id: 'fork_c1_1',
            text: '경적을 울리고 후방을 직접 확인한 후, 유도원의 수신호를 받고 서서히 후진한다.',
            isCorrect: true,
            feedback: '✅ 올바른 절차입니다! 지게차 후진 시 반드시 경적을 울려 주변에 알리고, 후방을 직접 확인하며, 유도원의 안내를 받아야 합니다. 특히 화물 적재 시 전방 시야가 제한되므로 후진은 더욱 주의가 필요합니다.',
            points: 60,
            nextStepId: 'fork_step2'
          },
          {
            id: 'fork_c1_2',
            text: '후방 카메라를 확인하고 바로 후진한다.',
            isCorrect: false,
            feedback: '⚠️ 후방 카메라는 보조 수단일 뿐입니다. 카메라의 사각지대가 있을 수 있으며, 사람이 갑자기 나타날 수 있습니다. 반드시 경적과 유도원 수신호를 병행해야 합니다.',
            points: 20,
            nextStepId: 'fork_step2'
          },
          {
            id: 'fork_c1_3',
            text: '주변에 사람이 없는 것 같으니 빠르게 후진하여 작업을 마친다.',
            isCorrect: false,
            feedback: '❌ 매우 위험합니다! "없는 것 같다"라는 판단은 절대 안전을 보장하지 않습니다. 지게차 후진 사고는 치명적 결과를 초래하며, 반드시 정해진 안전 절차를 따라야 합니다.',
            points: 0,
            nextStepId: 'fork_step2'
          }
        ]
      },
      {
        id: 'fork_step2',
        situation: '후진을 시작했는데, 갑자기 유도원이 정지 신호를 보냅니다. 뒤쪽 통로에서 다른 작업자가 이어폰을 끼고 걸어오고 있습니다. 상대방은 지게차를 인지하지 못한 것 같습니다.',
        image: '🛑',
        choices: [
          {
            id: 'fork_c2_1',
            text: '즉시 정지하고, 유도원이 해당 작업자를 안전하게 이동시킬 때까지 대기한다.',
            isCorrect: true,
            feedback: '✅ 정확합니다! 유도원의 정지 신호에는 즉시 따라야 합니다. 이어폰을 끼고 있어 경적을 못 들을 수 있으므로, 직접 접근하여 안전하게 이동시키는 것이 올바른 절차입니다.',
            points: 60,
            nextStepId: 'fork_step3'
          },
          {
            id: 'fork_c2_2',
            text: '경적을 연속으로 울려 작업자가 알아차리게 한 후 계속 후진한다.',
            isCorrect: false,
            feedback: '⚠️ 이어폰을 착용한 작업자는 경적을 못 들을 수 있습니다. 경적만으로 안전을 확보할 수 없으며, 반드시 정지한 후 직접 또는 유도원을 통해 보행자를 안전하게 이동시켜야 합니다.',
            points: 15,
            nextStepId: 'fork_step3'
          },
          {
            id: 'fork_c2_3',
            text: '작업자와 충분한 거리가 있으니 천천히 후진을 계속한다.',
            isCorrect: false,
            feedback: '❌ 보행자가 지게차를 인지하지 못한 상태에서 후진을 계속하면 충돌 사고가 발생할 수 있습니다. 거리에 관계없이 유도원의 정지 신호가 나오면 즉시 정지해야 합니다.',
            points: 0,
            nextStepId: 'fork_step3'
          }
        ]
      },
      {
        id: 'fork_step3',
        situation: '사고 없이 작업을 마쳤습니다. 그런데 이번 상황처럼 보행자가 이어폰을 끼고 다니는 문제가 반복되고 있습니다. 재발 방지를 위해 어떤 조치를 건의해야 할까요?',
        image: '📝',
        choices: [
          {
            id: 'fork_c3_1',
            text: '작업장 내 이어폰 착용 금지 규정 강화와 지게차 이동 구역/보행자 통로 분리를 건의한다.',
            isCorrect: true,
            feedback: '✅ 탁월한 판단입니다! 근본적인 재발 방지를 위해 이어폰 착용 금지 규정과 보행자-차량 동선 분리는 가장 효과적인 대책입니다. 물리적 분리(볼라드, 안전 펜스)와 행정적 조치를 병행하는 것이 이상적입니다.',
            points: 60,
            nextStepId: 'end'
          },
          {
            id: 'fork_c3_2',
            text: '해당 작업자에게만 주의를 준다.',
            isCorrect: false,
            feedback: '⚠️ 개인에 대한 주의는 일시적인 효과만 있습니다. 시스템적인 개선(구역 분리, 규정 강화, 안전 표지판 설치 등) 없이는 같은 문제가 반복됩니다. 근본 원인에 대한 대책이 필요합니다.',
            points: 15,
            nextStepId: 'end'
          },
          {
            id: 'fork_c3_3',
            text: '별도 조치 없이, 다음부터는 더 조심해서 후진하면 된다.',
            isCorrect: false,
            feedback: '❌ "더 조심하겠다"는 것은 안전 대책이 아닙니다. 구조적인 위험 요인이 해결되지 않으면 사고는 반복됩니다. 반드시 관리적, 공학적 대책을 수립하여 시스템적으로 위험을 제거해야 합니다.',
            points: 0,
            nextStepId: 'end'
          }
        ]
      }
    ]
  },

  // ===== 시나리오 5: 화학물질 누출 대응 =====
  {
    id: 'scenario_chemical_spill',
    title: '화학물질 누출 대응',
    description: '화학물질 저장 탱크에서 누출이 발생했습니다. 대피, MSDS 확인, 적절한 보호구 착용 등 신속한 대응이 필요합니다.',
    icon: '☣️',
    difficulty: 'hard',
    category: 'chemical',
    reward: { points: 280, exp: 75 },
    steps: [
      {
        id: 'chem_step1',
        situation: '화학물질 저장 창고를 지나가던 중, 바닥에 노란색 액체가 흘러나오는 것을 발견했습니다. 코를 찌르는 자극적인 냄새가 나며, 탱크의 밸브 부근에서 물질이 새고 있습니다. 드럼에는 "염산(HCl)" 표지가 붙어 있습니다.',
        image: '⚠️',
        choices: [
          {
            id: 'chem_c1_1',
            text: '즉시 바람이 불어오는 방향(풍상)으로 대피하고, 주변 작업자들에게 경보를 발령한다.',
            isCorrect: true,
            feedback: '✅ 정확합니다! 화학물질 누출 시 가장 먼저 해야 할 일은 안전한 거리로 대피하는 것입니다. 반드시 풍상(바람이 불어오는 방향)으로 대피해야 유해 증기를 피할 수 있습니다. 주변 인원 경보도 필수입니다.',
            points: 95,
            nextStepId: 'chem_step2'
          },
          {
            id: 'chem_c1_2',
            text: '걸레와 물로 유출된 액체를 닦아낸다.',
            isCorrect: false,
            feedback: '❌ 매우 위험합니다! 염산은 강산으로, 맨손으로 접촉하면 심각한 화학 화상을 입습니다. 또한 물과 반응 시 열과 유해가스가 발생할 수 있습니다. 적절한 보호구 없이 절대 접근하면 안 됩니다.',
            points: 0,
            nextStepId: 'chem_step2'
          },
          {
            id: 'chem_c1_3',
            text: '직접 밸브를 잠가서 누출을 멈춘다.',
            isCorrect: false,
            feedback: '⚠️ 적절한 보호구(내화학 보호복, 호흡보호구 등) 없이 누출 지점에 접근하는 것은 위험합니다. 염산 증기를 흡입하면 호흡기 손상이 발생하며, 피부 접촉 시 화학 화상을 입을 수 있습니다.',
            points: 10,
            nextStepId: 'chem_step2'
          }
        ]
      },
      {
        id: 'chem_step2',
        situation: '안전 지역으로 대피하고 경보를 발령했습니다. 비상대응팀이 출동 중이며, 누출 물질에 대한 정확한 정보가 필요합니다. 어떤 자료를 확인해야 할까요?',
        image: '📄',
        choices: [
          {
            id: 'chem_c2_1',
            text: 'MSDS(물질안전보건자료)를 확인하여 위험성, 응급조치, 누출 대응 방법을 파악한다.',
            isCorrect: true,
            feedback: '✅ 올바릅니다! MSDS에는 물질의 위험성, 취급 방법, 응급조치, 누출 대응, 필요한 보호구 등 모든 정보가 포함되어 있습니다. 비상대응팀에게 MSDS 정보를 전달하면 효과적인 대응이 가능합니다.',
            points: 95,
            nextStepId: 'chem_step3'
          },
          {
            id: 'chem_c2_2',
            text: '인터넷에서 "염산 위험성"을 검색한다.',
            isCorrect: false,
            feedback: '⚠️ 인터넷 검색은 시간이 오래 걸리고 정확한 정보를 찾기 어려울 수 있습니다. 해당 제품의 정확한 MSDS를 확인하는 것이 가장 빠르고 정확합니다. 모든 화학물질 취급 사업장에는 MSDS를 비치해야 합니다.',
            points: 20,
            nextStepId: 'chem_step3'
          },
          {
            id: 'chem_c2_3',
            text: '비상대응팀이 알아서 처리할 테니 특별히 확인할 필요가 없다.',
            isCorrect: false,
            feedback: '❌ 최초 발견자의 정보 제공은 매우 중요합니다. 누출 물질명, 양, 확산 방향 등을 비상대응팀에 정확히 전달해야 합니다. MSDS 정보를 함께 제공하면 대응 시간을 크게 단축할 수 있습니다.',
            points: 5,
            nextStepId: 'chem_step3'
          }
        ]
      },
      {
        id: 'chem_step3',
        situation: '비상대응팀이 도착하여 누출을 제어하기 시작했습니다. 팀장이 당신에게 보조 인력으로 누출 현장 근처에서 작업을 도와달라고 요청합니다. 어떤 보호구를 착용해야 할까요?',
        image: '🥽',
        choices: [
          {
            id: 'chem_c3_1',
            text: '내화학 보호복, 내화학 장갑, 방독 마스크(산가스용), 안전 고글, 안전화를 완전히 착용한다.',
            isCorrect: true,
            feedback: '✅ 완벽합니다! 염산 누출 대응 시 반드시 전신 내화학 보호복, 내화학 장갑, 산가스용 방독 마스크, 보안경(고글), 내화학 안전화를 착용해야 합니다. MSDS에 명시된 보호구를 모두 갖추는 것이 원칙입니다.',
            points: 90,
            nextStepId: 'end'
          },
          {
            id: 'chem_c3_2',
            text: '일반 작업복에 고무장갑과 방진 마스크를 착용한다.',
            isCorrect: false,
            feedback: '❌ 일반 작업복은 화학물질 침투를 막을 수 없고, 방진 마스크는 화학 증기를 필터링하지 못합니다. 염산 증기에는 반드시 산가스용 방독 마스크가 필요하며, 내화학 전용 보호구를 착용해야 합니다.',
            points: 10,
            nextStepId: 'end'
          },
          {
            id: 'chem_c3_3',
            text: '보호구 착용 없이 빠르게 도와주고 나온다.',
            isCorrect: false,
            feedback: '❌ 절대 안 됩니다! 보호구 없이 화학물질 누출 현장에 접근하면 심각한 건강 피해를 입습니다. 단 몇 초의 노출로도 화학 화상, 호흡기 손상, 눈 손상 등이 발생할 수 있습니다.',
            points: 0,
            nextStepId: 'end'
          }
        ]
      }
    ]
  }
];

/**
 * 시나리오 ID로 시나리오 데이터 조회
 * @param {string} id - 시나리오 ID
 * @returns {object|null} 시나리오 객체 또는 null
 */
export const getScenarioById = (id) => {
  return SCENARIOS.find(s => s.id === id) || null;
};

export default { SCENARIOS, getScenarioById };
