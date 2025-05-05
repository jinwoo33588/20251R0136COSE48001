import React, { useState } from 'react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);

  /*입력*/
  const handleInsert = (value) => {
    setInput((prev) => prev + ' ' + value + ' ');
  };

  /*임시 실행 결과 */
  const handleEvaluate = () => {
    if (!input.trim()) {
      setResult('입력값이 없습니다.');
      return; // 빈 입력이면 history에 아무것도 저장하지 않음
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
      case '+': return `${a}와 ${b}이(가) 결합되어 새로운 의미를 형성합니다`;
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

  /* api 연동 결과
  const handleEvaluate = async () => {
    if (!input.trim()) {
      setResult('입력값이 없습니다.');
      return;
    }

    setResult('AI가 결과를 생성 중입니다...');

    const output = await callOpenAI(input);

    if (output) {
      setResult(output);
      setHistory((prev) => [output, ...prev]); // 결과 기록에 저장
    } else {
      setResult('AI 응답을 가져오지 못했습니다.');
    }
  };

  const callOpenAI = async (inputText) => {
    console.log("📤 OpenAI 요청 내용:", inputText);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                '당신은 창의적인 텍스트 계산기입니다. 사용자가 입력한 단어들과 연산기호를 분석해 창의적이고 의미 있는 문장을 생성하세요.',
            },
            {
              role: 'user',
              content: inputText,
            },
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      console.log("📥 OpenAI 응답 내용:", data);

      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content.trim();
      } else {
        return null;
      }
    } catch (err) {
      console.error('❌ OpenAI API 오류:', err);
      return null;
    }
  };
  */
  const handleClearHistory = () => {
    if (window.confirm('모든 결과 기록을 삭제하시겠습니까?')) {
      setHistory([]);
    }
  };

  const handleCopyItem = (text) => {
    navigator.clipboard.writeText(text);
    alert('복사되었습니다: ' + text);
  };
  /*기록 삭제 */
  const handleDeleteItem = (index) => {
    setHistory((prev) => prev.filter((_, i) => i !== index));
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
  

  // 드롭 가능한 영역 위에 올라왔을 때 기본 동작 막기
  const handleDragOver = (e) => {
    e.preventDefault(); // 꼭 필요!
  };

  // 드롭했을 때 실행
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedText = e.dataTransfer.getData("text/plain");
    setInput((prev) => prev + ' ' + droppedText);
  };

  return (
    <div className="container">
      <div className="main-section">

        <div className="history-box">
          <div className="history-scroll">
            {history.length === 0 ? (
              <p className="empty-history">이전 결과가 없습니다.</p>
            ) : (
              history.map((item, index) => (
                <div key={index} className="history-item">
                  <div
                    className="history-text"
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragEnd={handleDragEnd}
                  >
                    {item}
                  </div>
                  <div className="history-buttons">
                    <button onClick={() => handleDeleteItem(index)} className="delete-button danger">X</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="right-panel">
          <div className="panel-wrapper">
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

          <div className={result ? 'result-box' : 'result-box empty'}>
            {result ? result : '결과가 여기에 표시됩니다...'}
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
      </div>
    </div>
  );
}

export default App;