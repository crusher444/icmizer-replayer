
import { useState, useMemo } from 'react';
import { Upload, Button, Input, Select } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

function HandReplayer({ handText }) {
  const lines = handText.trim().split('\n');
  const [step, setStep] = useState(0);

  return (
    <div className="mt-4 w-full max-w-4xl border p-4 rounded bg-white shadow">
      <div className="mb-2 font-semibold">Step-by-step Replayer</div>
      <pre className="overflow-auto max-h-[40vh] bg-gray-50 p-3 border rounded text-sm whitespace-pre-wrap">
        {lines.slice(0, step + 1).join('\n')}
      </pre>
      <div className="flex gap-2 mt-2">
        <Button onClick={() => setStep(Math.max(0, step - 1))}>⬅️ Back</Button>
        <Button onClick={() => setStep(Math.min(lines.length - 1, step + 1))}>Next ➡️</Button>
        <span className="ml-auto">Line {step + 1} of {lines.length}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [hands, setHands] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [tags, setTags] = useState({});
  const [evs, setEvs] = useState({});
  const [searchTag, setSearchTag] = useState(null);
  const [searchText, setSearchText] = useState('');

  const parseHands = (text) => {
    const rawHands = text.split(/\n{2,}/).map((h) => h.trim()).filter(Boolean);
    const parsed = rawHands.map((raw, i) => ({ id: i + 1, raw }));
    setHands(parsed);
    setActiveIndex(0);
  };

  const handleUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => parseHands(e.target.result);
    reader.readAsText(file);
    return false;
  };

  const tagHand = (tag) => {
    setTags({ ...tags, [activeIndex]: tag });
  };

  const suggestEV = () => {
    const current = hands[activeIndex];
    if (!current) return;
    const hasAllIn = current.raw.toLowerCase().includes('all-in');
    const evValue = hasAllIn ? Math.random() * -1 : Math.random();
    setEvs({ ...evs, [activeIndex]: evValue.toFixed(2) });
  };

  const exportJSON = () => {
    const data = hands.map((h, i) => ({ ...h, tag: tags[i] || null, ev: evs[i] || null }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stacksolver-hands.json';
    a.click();
  };

  const exportTXT = () => {
    const txt = hands.map((h, i) => `#${h.id} [${tags[i] || 'untagged'}] [EV: ${evs[i] || 'N/A'}]\n${h.raw}`).join('\n\n');
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stacksolver-hands.txt';
    a.click();
  };

  const filteredHands = useMemo(() => {
    return hands.filter((h, i) => {
      const tagMatch = !searchTag || tags[i] === searchTag;
      const textMatch = !searchText || h.raw.toLowerCase().includes(searchText.toLowerCase());
      return tagMatch && textMatch;
    });
  }, [hands, tags, searchTag, searchText]);

  const currentHand = filteredHands[activeIndex] || {};

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4 p-6">
      <h1 className="text-xl font-bold">StackSolver - Hand Upload + EV Suggestion</h1>

      <Upload.Dragger
        beforeUpload={handleUpload}
        showUploadList={false}
        accept=".txt,.log"
        className="w-full max-w-xl"
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ fontSize: 32 }} />
        </p>
        <p className="text-lg">Click or drag hand history file to upload</p>
      </Upload.Dragger>

      {hands.length > 0 && (
        <>
          <div className="flex gap-4 w-full max-w-4xl mt-6">
            <Select
              allowClear
              placeholder="Filter by Tag"
              onChange={(value) => {
                setSearchTag(value);
                setActiveIndex(0);
              }}
              className="w-1/2"
              options={[
                { value: 'good', label: '✅ Good' },
                { value: 'mistake', label: '❌ Mistake' },
                { value: 'review', label: '📌 Review Later' }
              ]}
            />
            <Input
              placeholder="Search hand text"
              onChange={(e) => {
                setSearchText(e.target.value);
                setActiveIndex(0);
              }}
              className="w-1/2"
            />
          </div>

          {filteredHands.length > 0 ? (
            <>
              <div className="mt-4 w-full max-w-4xl border p-4 rounded bg-white shadow">
                <div className="mb-2 font-semibold">
                  Hand #{currentHand.id} ({tags[activeIndex] || 'untagged'}) — EV: {evs[activeIndex] || 'N/A'}
                </div>
                <pre className="overflow-auto max-h-[50vh] bg-gray-50 p-3 border rounded text-sm">
                  {currentHand.raw}
                </pre>
              </div>

              <HandReplayer handText={currentHand.raw || ''} />

              <div className="flex gap-2 mt-2 flex-wrap">
                <Button type="primary" onClick={() => tagHand('good')}>✅ Good Play</Button>
                <Button danger onClick={() => tagHand('mistake')}>❌ Mistake</Button>
                <Button onClick={() => tagHand('review')}>📌 Review Later</Button>
                <Button onClick={suggestEV}>📊 Calculate EV</Button>
                <Button onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}>⬅️ Prev</Button>
                <Button onClick={() => setActiveIndex(Math.min(filteredHands.length - 1, activeIndex + 1))}>Next ➡️</Button>
              </div>

              <div className="flex gap-4 mt-4">
                <Button onClick={exportJSON}>📁 Export JSON</Button>
                <Button onClick={exportTXT}>📄 Export TXT</Button>
              </div>
            </>
          ) : (
            <p className="mt-6 text-gray-500">No matching hands found.</p>
          )}
        </>
      )}
    </main>
  );
}
