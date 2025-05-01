import React, { useState } from 'react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);

  const handleInsert = (value) => {
    setInput((prev) => prev + ' ' + value + ' ');
  };

  const handleEvaluate = () => {
    const tokens = input.trim().split(/\s+/);
    if (tokens.length < 3) {
      setResult('올바른 형식으로 입력해주세요.');
      setHistory((prev) => [...prev, '❌ 올바른 형식으로 입력해주세요.']);
      return;
    }

    let output = tokens[0];
    let i = 1;
    while (i < tokens.length - 1) {
      const op = tokens[i];
      const next = tokens[i + 1];
      output = applyMeaning(output, next, op);
      i += 2;
    }

    setResult(output);
    setHistory((prev) => [...prev, `✅ ${output}`]);
  };

  const applyMeaning = (a, b, op) => {
    switch (op) {
      case '+': return `${a}와 ${b}이(가) 결합되어 새로운 의미를 형성합니다.`;
      case '-': return `${a}에서 ${b}의 개념이 제거되어 정제된 의미가 됩니다.`;
      case '×': return `${a}과 ${b}이(가) 곱해져 복합적인 의미를 가집니다.`;
      case '÷': return `${a}을(를) ${b}로 나눠 세부 요소를 분리합니다.`;
      case '<>': return `${a}과 ${b}은(는) 대조적인 개념으로 비교됩니다.`;
      case '→': return `${a}이(가) ${b}으로 변화합니다.`;
      case '()': return `${a} 안에 ${b}이(가) 부가적으로 포함됩니다.`;
      case '∴': return `${a}와 ${b}으로부터 논리적인 결론이 도출됩니다.`;
      default: return `${a} ${op} ${b}`;
    }
  };

  const handleCopyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      alert('결과가 복사되었습니다!');
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('모든 결과 기록을 삭제하시겠습니까?')) {
      setHistory([]);
    }
  };

  const handleCopyItem = (text) => {
    navigator.clipboard.writeText(text);
    alert('복사되었습니다: ' + text);
  };

  const handleDeleteItem = (index) => {
    setHistory((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container">
      <h1 className="title">TEXT CALCULATION</h1>

      <div className="main-section">
        <div className="history-box">
          <h2>📜 결과 기록
          <div className="result-buttons">
              <button onClick={handleCopyResult} className="action-button">📋 결과 복사</button>
              <button onClick={handleClearHistory} className="action-button danger">🗑️ 기록 초기화</button>
            </div>
          </h2>
          <div className="history-scroll">
            {history.length === 0 ? (
              <p className="empty-history">이전 결과가 없습니다.</p>
            ) : (
              history.map((item, index) => (
                <div key={index} className="history-item">
                  <span>{item}</span>
                  <div className="history-buttons">
                    <button onClick={() => handleCopyItem(item)} className="mini-button">📋</button>
                    <button onClick={() => handleDeleteItem(index)} className="mini-button danger">❌</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="right-box">
          <textarea
            className="input-area"
            placeholder="텍스트를 입력하세요..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <div className={result ? 'result-box' : 'result-box empty'}>
            {result ? result : '결과가 여기에 표시됩니다...'}
          </div>

          {result && (
            <div className="result-buttons">
              <button onClick={handleCopyResult} className="action-button">📋 결과 복사</button>
              <button onClick={handleClearHistory} className="action-button danger">🗑️ 기록 초기화</button>
            </div>
          )}

          <div className="operator-grid">
            {['+', '-', '×', '÷', '<>', '()', '→', '∴'].map((op) => (
              <button
                key={op}
                className="operator-button"
                onClick={() => handleInsert(op)}
              >
                {op}
              </button>
            ))}
            <button className="equal-button" onClick={handleEvaluate}>
              =
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
