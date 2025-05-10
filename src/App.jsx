import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [overflowedItems, setOverflowedItems] = useState({});
  
  const textRefs = useRef([]);

 

  const handleInsert = (value) => {
    setInput((prev) => `${prev.trim()} ${value} `);
  };

  const handleEvaluate = () => {
    if (!input.trim()) {
      setResult('입력값이 없습니다.');
      return;
    }
  
    const tokens = input.trim().split(/\s+/);
  
    let output = tokens[0];
    let i = 1;
    while (i < tokens.length - 1) {
      const op = tokens[i];
      const next = tokens[i + 1];
      output = applyMeaning(output, next, op);
      i += 2;
    }
  
    setResult(output);
    setHistory((prev) => [...prev, ` ${output}`]);
  };
  
  const applyMeaning = (a, b, op) => {
    switch (op) {
      case '+': return `${a}${b}`;
      case '-': return `${a}에서 ${b}의 개념이 제거되어 정제된 의미가 됩니다`;
      case '×': return `${a}과 ${b}이(가) 곱해져 복합적인 의미를 가집니다`;
      case '÷': return `${a}을(를) ${b}로 나눠 세부 요소를 분리합니다`;
      case '<>': return `${a}과 ${b}은(는) 대조적인 개념으로 비교됩니다`;
      case '→': return `${a}이(가) ${b}으로 변화합니다`;
      case '()': return `${a} 안에 ${b}이(가) 부가적으로 포함됩니다`;
      case '∴': return `${a}와 ${b}으로부터 논리적인 결론이 도출됩니다`;
      default: return `${a} ${op} ${b}`;
    }
  };

  /*기록 삭제 */
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

  /*드래그 기능 */
   // 드래그 시작할 때 실행
  const handleDragStart = (e, text) => {
    // 드래그 데이터 설정
    e.dataTransfer.setData("text/plain", text);
  
    // 1. 가상 엘리먼트 생성
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
  
    // 2. drag 이미지 설정
    e.dataTransfer.setDragImage(ghost, 0, 0);
  
    // 3. drag 끝나면 제거
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
    e.preventDefault(); // 꼭 필요!
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedText = e.dataTransfer.getData("text/plain");
    setInput((prev) => prev + '' + droppedText);
  };

  // history overflow 여부 계산
  useEffect(() => {
    const newMap = {};
    textRefs.current.forEach((el, idx) => {
      if (el) {
        newMap[idx] = el.scrollWidth > el.clientWidth;
      }
    });
    setOverflowedItems(newMap);
  }, [history]);


  const toggleExpand = (index) => {
    setExpandedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };
  

  
  return (
    <div className="container">
      <div className="main-section">

      <div className="history-box">
          <div className="history-scroll">
            {history.length === 0
              ? <p className="empty-history">이전 결과가 없습니다.</p>
              : (() => {
                  // 3) 리렌더링될 때마다 refs 초기화
                  textRefs.current = [];
                  return history.map((item, index) => (
                    <div key={index} className="history-item">
                      {/* 4) overflow 된 경우에만 버튼 보이기 */}
                      {overflowedItems[index] && (
                        <button
                          className="expand-button"
                          onClick={() => setExpandedItems(prev => ({
                            ...prev, [index]: !prev[index]
                          }))}
                        >
                          {expandedItems[index] ? '⬆' : '>'}
                        </button>
                      )}

                      <div
                        ref={el => textRefs.current[index] = el}
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
            }
          </div>
        </div>

        <div className="right-panel">
          <div className="title-panel">
          <h1 className="title">TEXT <br />CALCULATION</h1>
          <div className="panel-box">
          <textarea
            className="input-area"
            placeholder="텍스트를 입력하세요..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          />

          <div
            className={result ? 'result-box' : 'result-box empty'}
            onClick={() => {
              if (result) {
                setModalOpen(true);
              }
            }}
          >
            <div className="result-content">
              {result || '결과가 여기에 표시됩니다...'}
            </div>
            {result && (
              <button
                className="explanation-button"
                onClick={e => {
                  e.stopPropagation();    // 부모 클릭 이벤트 방지
                  setModalOpen(true);     // 모달 열기
                }}
              >
                풀이보기
              </button>
            )}
          </div>


          <div className="operator-grid">
          {['+', '-', '×', '÷', '<>', '()', '→', '∴', '='].map((op) => (
            <button
              key={op}
              className={op === '=' ? 'equal-button' : 'operator-button'}
              onClick={() => op === '=' ? handleEvaluate() : handleInsert(op)}
            >
            {op}
            </button>
          ))}

          </div>
        </div>
      </div>
      </div>
      {modalOpen && (
          <div className="modal-overlay" onClick={() => setModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}> /* 내부클릭 방지 */
              <div className="modal-header">
                
              </div>
              <div className="modal-card">
                <button className="close-button" onClick={() => setModalOpen(false)}>
                  풀이닫기
                </button>
                <p>결과 상세 내용을 여기에 표시할 수 있습니다.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;