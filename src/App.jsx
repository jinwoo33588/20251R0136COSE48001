import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { getStructuredOutput } from './openaiClient.js';

function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [detailedResult, setDetailedResult] = useState('');
  const [history, setHistory] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [overflowedItems, setOverflowedItems] = useState({});

  const textRefs = useRef([]);

  const handleInsert = (value) => {
    setInput((prev) => `${prev.trim()} ${value} `);
  };

  const handleEvaluate = async () => {
    if (!input.trim()) {
      setResult('입력값이 없습니다.');
      return;
    }

    try {
      const response = await getStructuredOutput(input);

      if (response) {
        setResult(response.text_output);
        setDetailedResult(response.outpue_detailed);
        setHistory((prev) => [...prev, response.text_output]);
      } else {
        setResult('OpenAI 응답이 없습니다.');
      }
    } catch (error) {
      setResult('처리 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

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
              
              {/*operator 수정 필요*/}
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
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header" />
              <div className="modal-card">
                <button className="close-button" onClick={() => setModalOpen(false)}>
                  풀이닫기
                </button>
                <p>{detailedResult || '결과 상세 내용을 여기에 표시할 수 있습니다.'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;