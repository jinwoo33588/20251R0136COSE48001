import React, { useState } from 'react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);

  const handleInsert = (value) => {
    setInput((prev) => prev + ' ' + value + ' ');
  };

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
        {/* 결과 기록 영역 */}
        <div className="history-box">
          <h2>
            📜 결과 기록
            <div className="result-buttons">
              <button onClick={handleClearHistory} className="clear-history danger">
                🗑️ 기록 초기화
              </button>
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
                    <button onClick={() => handleCopyItem(item)} className="mini-button">
                      복사
                    </button>
                    <button onClick={() => handleDeleteItem(index)} className="mini-button">
                      삭제
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 입력 및 결과 영역 */}
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
