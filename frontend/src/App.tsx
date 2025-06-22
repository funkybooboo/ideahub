import { useEffect, useState } from "react";

interface Idea { id: number; title: string; description: string; }

function App() {
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");

    useEffect(() => {
        fetch("/api/ideas")
            .then(res => res.json())
            .then(setIdeas)
            .catch(console.error);
    }, []);

    const submit = async () => {
        const res = await fetch("/api/ideas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description: desc })
        });
        if (res.ok) {
            const newIdea = await res.json();
            setIdeas(prev => [...prev, newIdea]);
            setTitle(""); setDesc("");
        }
    };

    return (
        <div style={{ padding: "1rem" }}>
            <h1>IdeaHub</h1>
            <input
                placeholder="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
            />
            <br/>
            <textarea
                placeholder="Description"
                value={desc}
                onChange={e => setDesc(e.target.value)}
            />
            <br/>
            <button onClick={submit}>Add Idea</button>
            <ul>
                {ideas.map(i => (
                    <li key={i.id}>
                        <strong>{i.title}</strong><br/>
                        {i.description}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
