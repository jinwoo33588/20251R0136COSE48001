import React, { useState } from 'react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  const handleInsert = (value) => {
    setInput((prev) => prev + ' ' + value + ' ');
  };

  const handleEvaluate = () => {
    const tokens = input.trim().split(/\s+/);
    if (tokens.length < 3) {
      setResult('올바른 형식으로 입력해주세요.');
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
  };

  const applyMeaning = (a, b, op) => {
    switch (op) {
      case '+':
        return `${a}와 ${b}이(가) 결합되어 새로운 의미를 형성합니다.`;
      case '-':
        return `${a}에서 ${b}의 개념이 제거되어 정제된 의미가 됩니다.`;
      case '×':
        return `${a}과 ${b}이(가) 곱해져 복합적인 의미를 가집니다.`;
      case '÷':
        return `${a}을(를) ${b}로 나눠 세부 요소를 분리합니다.`;
      case '<>':
        return `${a}과 ${b}은(는) 대조적인 개념으로 비교됩니다.`;
      case '→':
        return `${a}이(가) ${b}으로 변화합니다.`;
      case '()':
        return `${a} 안에 ${b}이(가) 부가적으로 포함됩니다.`;
      case '∴':
        return `${a}와 ${b}으로부터 논리적인 결론이 도출됩니다.`;
      default:
        return `${a} ${op} ${b}`;
    }
  };

  return (
    <div className="container">
      <h1 className="title">🧠 텍스트 계산기</h1>

      <div className="input-section">
        <textarea
          className="input-area"
          placeholder="텍스트를 입력하세요..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

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

      <div className={result ? 'result-box' : 'result-box empty'}>
        {result ? result : '결과가 여기에 표시됩니다...'}
      </div>
    </div>
  );
}

export default App;
