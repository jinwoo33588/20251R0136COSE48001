import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { getStructuredOutput } from './openaiClient.js';

import LogoIcon from './assets/images/logo.png';
import PlusIcon from './assets/operators/plus.png';         // + (덧셈)
import MinusIcon from './assets/operators/minus.png';       // – (뺄셈)
import MultiplyIcon from './assets/operators/multiply.png'; // × (곱셈)
import DivideIcon from './assets/operators/divide.png';     // ÷ (나눗셈)
import PowerIcon from './assets/operators/power.png';       // ^ (제곱)
import SqrtIcon from './assets/operators/sqrt.png';         // √ (루트)

import SigmaIcon from './assets/operators/sigma.png';       // ∑ (시그마)
import IntegralIcon from './assets/operators/integral.png'; // ∫ (적분)
import PartialIcon from './assets/operators/partial.png';   // ∂ (미분)
import ResetIcon from './assets/operators/reset.png';           // re(리셋)
import Equal from './assets/operators/equal.png';   // = (등호)


/* ─────────────────────────────────────────────────────────────────────────
   operators 배열 정의
   key: 내부 로직에서 식별용,
   src: import한 이미지 변수,
   alt: 접근성(alt 텍스트)
   ───────────────────────────────────────────────────────────────────────── */
const operators = [
  { key: 'plus',     src: PlusIcon,     alt: '덧셈'    },
  { key: 'minus',    src: MinusIcon,    alt: '뺄셈'    },
  { key: 'multiply', src: MultiplyIcon, alt: '곱셈'    },
  { key: 'reset',    src: ResetIcon,    alt: '리셋'    },
  { key: 'divide',   src: DivideIcon,   alt: '나눗셈'  },
  { key: 'sqrt',     src: SqrtIcon,     alt: '루트'    },
  { key: 'sigma',    src: SigmaIcon,    alt: '시그마'  },
  { key: 'integral', src: IntegralIcon, alt: '적분'    },
  { key: 'partial',  src: PartialIcon,  alt: '미분'    },
  { key: 'equal',    src: Equal,        alt: '등호'    }, 
];

// key → 실제 기호 매핑
const operatorMap = {
  plus: '+',
  minus: '-',
  multiply: '×',
  divide: '÷',
  sqrt: '√',
  sigma: '∑',
  integral: '∫',
  partial: '∂',
};

function App() {
/* ───────────────────────────────────────────────────────────────
    React 상태 선언
    ─────────────────────────────────────────────────────────────── */
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [detailedResult, setDetailedResult] = useState('');
  const [history, setHistory] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [overflowedItems, setOverflowedItems] = useState({});

  const [showTopFade, setShowTopFade] = useState(false);       // (추가) 상단 그라데이션 표시 여부
  const [showBottomFade, setShowBottomFade] = useState(false); // (추가) 하단 그라데이션 표시 여부

 /* ───────────────────────────────────────────────────────────────
     <textarea> DOM에 접근하기 위한 ref
     ─────────────────────────────────────────────────────────────── */
     const historyScrollRef = useRef(null); 
  const textareaRef = useRef(null);
  const textRefs = useRef([]);

  /* ───────────────────────────────────────────────────────────────
     handleInsert: “연산자 키(key)” 전달받아
       1) textareaRef.current.value (실제 DOM 값)에서 현재 cursor 위치 읽기
       2) 커서 위치 앞뒤 문자열을 잘라서 “기호”를 사이에 삽입
       3) setInput(newValue)로 상태 업데이트
       4) 상태 반영된 뒤(setTimeout 0) 커서를 “삽입된 기호 바로 뒤”로 옮김
     ─────────────────────────────────────────────────────────────── */
     const handleInsert = (key) => {
      const symbol = operatorMap[key] || '';
      if (!symbol || !textareaRef.current) return;
  
      // (1) 현재 <textarea>의 실제 값을 가져온다
      const textarea = textareaRef.current;
      const value = textarea.value; 
  
      // (2) 커서의 시작/끝 위치를 읽어온다
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
  
      // (3) “커서 앞(before)” 문자열, “커서 뒤(after)” 문자열
      const before = value.slice(0, start);
      const after  = value.slice(end);
  
      // (4) 새 문자열 = before + symbol + after
      const newValue = before + symbol + after;
      setInput(newValue);
  
      // (5) 상태 업데이트 후, “기호 바로 뒤”로 커서 이동
      setTimeout(() => {
        const pos = before.length + symbol.length;
        textarea.focus();
        textarea.setSelectionRange(pos, pos);
      }, 0);
    };

/* ───────────────────────────────────────────────────────────────
     handleEvaluate: “=” 버튼 클릭 시 OpenAI 호출 후 결과 처리
     ─────────────────────────────────────────────────────────────── */
  const handleEvaluate = async () => {
    if (!input.trim()) {
      setResult('입력값이 없습니다.');
      return;
    }
    try {
      const response = await getStructuredOutput(input);
      if (response) {
        setResult(response.text_output);
        setDetailedResult(response.output_detailed);
        setHistory((prev) => [...prev, response.text_output]);

        // 결과 반영 뒤, (원한다면) 커서를 맨 끝으로 옮기기
        setTimeout(() => {
          if (textareaRef.current) {
            const len = (response.text_output || '').length;
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(len, len);
          }
        }, 0);
      } else {
        const noResponseMsg = 'OpenAI 응답이 없습니다.';
        setResult(noResponseMsg);

        // ─────────────────────────────────────────────────────────────
        // 히스토리에 저장방식 선택(테스트용)
        // ─────────────────────────────────────────────────────────────
         //setHistory((prev) => [...prev, noResponseMsg]);
         setHistory((prev) => [...prev, input]);
      }
    } catch (error) {
      setResult('처리 중 오류가 발생했습니다.');
      console.error(error);
    }
  };
  /* ───────────────────────────────────────────────────────────────
     handleReset: “리셋” 클릭 시 호출
     - input, result, detailedResult 초기화
     ─────────────────────────────────────────────────────────────── */
  const handleReset = () => {
    setInput('');
    setResult('');
    setDetailedResult('');

    // 초기화 후 커서를 입력창 맨 앞(0)으로 옮기기
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(0, 0);
    }
  };
/* ───────────────────────────────────────────────────────────────
     handleDeleteItem: 히스토리 항목 삭제
     ─────────────────────────────────────────────────────────────── */
  const handleDeleteItem = (index) => {
    setHistory((prev) => prev.filter((_, i) => i !== index));
    setExpandedItems((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
    setOverflowedItems((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

/* ───────────────────────────────────────────────────────────────
     handleDragStart / handleDragEnd / handleDragOver / handleDrop
     (히스토리 드래그 기능)
     ─────────────────────────────────────────────────────────────── */
  const handleDragStart = (e, text) => {
    e.dataTransfer.setData("text/plain", text);

    const ghost = document.createElement("div");
    ghost.textContent = text;
    ghost.style.position = "absolute";
    ghost.style.top = "-9999px";
    ghost.style.left = "-9999px";
    ghost.style.padding = "4px 8px";
    ghost.style.background = "#555555";
    ghost.style.color = "#ffffff";
    ghost.style.fontSize = "0.875rem";
    ghost.style.border = "1px solid #ccc";
    ghost.style.borderRadius = "6px";
    ghost.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
    ghost.style.pointerEvents = "none";
    document.body.appendChild(ghost);

    e.dataTransfer.setDragImage(ghost, 0, 0);
    e.target._ghost = ghost;
  };

  const handleDragEnd = (e) => {
    const ghost = e.target._ghost;
    if (ghost) {
      document.body.removeChild(ghost);
      delete e.target._ghost;
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedText = e.dataTransfer.getData("text/plain");
    setInput((prev) => prev + ' ' + droppedText);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 스크롤이벤트 핸들러: historyScrollRef.current.scrollTop/scrollHeight/clientHeight를 읽어
  // 맨 위면 상단 fade 숨기고, 맨 아래면 하단 fade 숨기도록 상태를 토글
  // ──────────────────────────────────────────────────────────────────────────
  const handleHistoryScroll = () => {
    const el = historyScrollRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    // 위쪽 끝: scrollTop <= 0
    setShowTopFade(scrollTop > 0);
    // 아래쪽 끝: scrollTop + clientHeight >= scrollHeight
    setShowBottomFade(scrollTop + clientHeight < scrollHeight);
  };

  useEffect(() => {
    const el = historyScrollRef.current;
    if (el) {
      // 맨 아래로 스크롤
      el.scrollTop = el.scrollHeight;
      // 초기에는 맨 아래에 있으므로 fade 모두 숨기기
      setShowTopFade(false);
      setShowBottomFade(false);
    }
  }, [history]);
/* ───────────────────────────────────────────────────────────────
     히스토리 오버플로우 여부 계산(useEffect)
     ─────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const newMap = {};
    textRefs.current.forEach((el, idx) => {
      if (el) {
        newMap[idx] = el.scrollWidth > el.clientWidth;
      }
    });
    setOverflowedItems(newMap);
  }, [history]);

/* ───────────────────────────────────────────────────────────────
     히스토리 항목 확장/축소 토글
     ─────────────────────────────────────────────────────────────── */
  const toggleExpand = (index) => {
    setExpandedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };



  const gridItems = [
    
    operators[0],   // 1열: 덧셈(+)
    operators[1],   // 2열: 뺄셈(-)
    operators[2],   // 3열: 곱셈(×)
    operators[3],   // 4열: 리셋(re)
    
    
    operators[4],   // 1열: 나누기
    operators[5],   // 2열: 루트(√)
    operators[6],   // 3열: 시그마(∑)
    null,           // 4열: 빈칸

    operators[7],   // 1열: 적분(∫)
    operators[8],   // 2열: 미분(∂)
    operators[9],   // 3열: =
    null,           // 4열: 빈칸
  ];

  return (
    <div className="container">
      <div className="main-section">
        <div className="history-box">
        <div className="history-container"> 
          {/* ── 상단 페이드 오버레이 ── */}
          <div className={`scroll-fade top-fade ${showTopFade ? 'visible' : ''}`} />
          <div className="history-scroll" 
              ref={historyScrollRef}
              onScroll={handleHistoryScroll}>
            {history.length === 0 ? (
              <p className="empty-history">이전 결과가 없습니다.</p>
            ) : (
              (() => {
                textRefs.current = [];
                return history.map((item, index) => (
                  <div key={index} className="history-item">
                    {overflowedItems[index] && (
                      <button
                        className="expand-button"
                        onClick={() => toggleExpand(index)}
                      >
                        {expandedItems[index] ? '⬆' : '>'}
                      </button>
                    )}

                    <div
                      ref={(el) => (textRefs.current[index] = el)}
                      className={`history-text ${expandedItems[index] ? 'expanded' : 'collapsed'}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onDragEnd={handleDragEnd}
                    >
                      {item}
                    </div>

                    <div className="history-buttons">
                      <button
                        onClick={() => handleDeleteItem(index)}
                        className="delete-button danger"
                      >
                        X
                      </button>
                    </div>
                  </div>
                ));
              })()
            )}
            </div>
            {/* ── 하단 페이드 오버레이 ── */}
            <div className={`scroll-fade bottom-fade ${showBottomFade ? 'visible' : ''}`} />
          </div>
        </div>

        <div className="right-panel">
          <div className="title-panel">
          <img src={LogoIcon} alt="앱 로고" className="title-icon" />
            <div className="panel-box">
              <textarea
                ref={textareaRef}
                className="input-area"
                placeholder="텍스트를 입력하세요..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              />

              <div
                className={result ? 'result-box' : 'result-box empty'}
                onClick={() => result && setModalOpen(true)}
              >
                <div className="result-content">
                  {result || '결과가 여기에 표시됩니다...'}
                </div>
                {result && (
                  <button
                    className="explanation-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalOpen(true);
                    }}
                  >
                    풀이보기
                  </button>
                )}
              </div>
              
               {/* ── 4×3 그리드: gridItems 배열을 순회 ── */}
              <div className="operator-grid">
                {gridItems.map((item, idx) => {
                  if (item === null) {
                    // 빈칸: item이 null이면 빈 div 렌더링
                    return <div key={`empty-${idx}`} className="operator-empty" />;
                  } else {
                    // 연산자 버튼
                    const { key, src, alt } = item;
                    return (
                      <button
                        key={key + '-' + idx}
                        className={
                           key === 'equal' || key === 'reset'
                            ? 'equal-button operator-button--image'
                            : 'operator-button operator-button--image'
                        }
                        onClick={() => {
                          if (key === 'equal') {
                            handleEvaluate();
                          } else if (key === 'reset') {
                            handleReset();
                          } else {
                            handleInsert(key);
                          }
                        }}
                      >
                        <img src={src} alt={alt} className="operator-icon" />
                      </button>
                    );
                  }
                })}
                

              </div>
            </div>
          </div>
        </div>

        {modalOpen && (
          <div className="modal-overlay" onClick={() => setModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header" />
              <div className="modal-card">
                <button className="close-button" onClick={() => setModalOpen(false)}>
                  풀이 닫기
                </button>
                <div className="modal-result">
                  {result || '결과가 여기에 표시됩니다.'}</div>
                <div className="modal-divider" />
                <div className="modal-body">
                <p className="modal-description">
                  {detailedResult || '상세 설명이 여기에 표시됩니다.'}</p>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  </div>
  );
}

export default App;