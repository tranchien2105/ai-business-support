'use client';

import { FormEvent, useState } from 'react';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export default function AiAssistantPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const message = input.trim();

        if (!message || loading) {
            return;
        }

        // Lưu history trước khi thêm message hiện tại.
        // Đây chính là conversation history gửi cho backend.
        const history = messages.filter(
            (item) => item.content.trim() !== '',
        );

        setInput('');
        setLoading(true);

        setMessages((prev) => [
            ...prev,
            {
                role: 'user',
                content: message,
            },
            {
                role: 'assistant',
                content: '',
            },
        ]);

        try {
            const response = await fetch('http://localhost:3001/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    history,
                }),
            });

            if (!response.ok) {
                throw new Error('Request failed');
            }

            if (!response.body) {
                throw new Error('Response body is empty');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let assistantMessage = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                const chunk = decoder.decode(value, {
                    stream: true,
                });

                assistantMessage += chunk;

                setMessages((prev) => {
                    const next = [...prev];
                    const lastMessage = next[next.length - 1];

                    if (lastMessage?.role === 'assistant') {
                        next[next.length - 1] = {
                            ...lastMessage,
                            content: assistantMessage,
                        };
                    }

                    return next;
                });
            }
        } catch (error) {
            console.error(error);

            setMessages((prev) => {
                const next = [...prev];
                const lastMessage = next[next.length - 1];

                if (lastMessage?.role === 'assistant') {
                    next[next.length - 1] = {
                        ...lastMessage,
                        content: 'Xin lỗi, đã xảy ra lỗi khi kết nối với AI.',
                    };
                }

                return next;
            });
        } finally {
            setLoading(false);
        }
    }

    function clearConversation() {
        setMessages([]);
    }

    return (
        <main className="min-h-screen bg-[#f7f8fa]">
            <div className="flex min-h-screen">
                {/* Sidebar */}
                <aside className="hidden w-[260px] shrink-0 border-r border-gray-200 bg-white lg:flex lg:flex-col">
                    <div className="flex h-16 items-center border-b border-gray-100 px-5">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-sm font-bold text-white">
                                AI
                            </div>

                            <div>
                                <div className="text-sm font-semibold text-gray-900">
                                    Business AI
                                </div>

                                <div className="text-[11px] text-gray-400">
                                    Assistant
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 p-3">
                        <button
                            onClick={clearConversation}
                            className="mb-4 flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                        >
                            <span className="text-lg">+</span>
                            New conversation
                        </button>

                        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                            Workspace
                        </div>

                        <div className="space-y-1">
                            <div className="rounded-lg bg-gray-100 px-3 py-2.5 text-sm font-medium text-gray-800">
                                AI Assistant
                            </div>

                            <div className="rounded-lg px-3 py-2.5 text-sm text-gray-500">
                                Analytics
                            </div>

                            <div className="rounded-lg px-3 py-2.5 text-sm text-gray-500">
                                Orders
                            </div>

                            <div className="rounded-lg px-3 py-2.5 text-sm text-gray-500">
                                Customers
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 p-4">
                        <div className="flex items-center gap-3 rounded-xl p-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                                C
                            </div>

                            <div className="min-w-0">
                                <div className="truncate text-sm font-medium text-gray-800">
                                    Admin
                                </div>

                                <div className="truncate text-xs text-gray-400">
                                    Business workspace
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main */}
                <section className="flex min-w-0 flex-1 flex-col">
                    {/* Header */}
                    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white/80 px-5 backdrop-blur">
                        <div>
                            <h1 className="text-sm font-semibold text-gray-900">
                                AI Assistant
                            </h1>

                            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                AI is online
                            </div>
                        </div>

                        <button
                            onClick={clearConversation}
                            className="rounded-lg px-3 py-2 text-xs font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                        >
                            Clear
                        </button>
                    </header>

                    {/* Chat */}
                    <div className="flex flex-1 flex-col">
                        {messages.length === 0 ? (
                            <div className="flex flex-1 items-center justify-center px-5">
                                <div className="w-full max-w-2xl">
                                    <div className="mb-10 text-center">
                                        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 text-lg font-bold text-white shadow-lg">
                                            AI
                                        </div>

                                        <h2 className="text-3xl font-semibold tracking-tight text-gray-950">
                                            How can I help your business?
                                        </h2>

                                        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-500">
                                            Ask questions about your orders, customers, products,
                                            sales and business performance.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <Suggestion
                                            title="Analyze today's sales"
                                            description="Give me a quick overview of today's performance."
                                            onClick={() =>
                                                setInput('Phân tích tình hình bán hàng hôm nay')
                                            }
                                        />

                                        <Suggestion
                                            title="Order status"
                                            description="Check the status of a specific order."
                                            onClick={() =>
                                                setInput('Kiểm tra trạng thái đơn hàng #12345')
                                            }
                                        />

                                        <Suggestion
                                            title="Top products"
                                            description="Find the products generating the most sales."
                                            onClick={() =>
                                                setInput('Cho tôi biết top sản phẩm bán chạy nhất')
                                            }
                                        />

                                        <Suggestion
                                            title="Business insights"
                                            description="Get insights from your business data."
                                            onClick={() =>
                                                setInput(
                                                    'Cho tôi một số insight về hoạt động kinh doanh',
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto px-5 py-8">
                                <div className="mx-auto max-w-3xl space-y-7">
                                    {messages.map((message, index) => (
                                        <div
                                            key={index}
                                            className={`flex gap-4 ${message.role === 'user'
                                                ? 'justify-end'
                                                : 'justify-start'
                                                }`}
                                        >
                                            {message.role === 'assistant' && (
                                                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-[10px] font-bold text-white">
                                                    AI
                                                </div>
                                            )}

                                            <div
                                                className={
                                                    message.role === 'user'
                                                        ? 'max-w-[80%] rounded-2xl rounded-br-md bg-gray-900 px-4 py-3 text-sm leading-6 text-white'
                                                        : 'max-w-[80%] text-sm leading-7 text-gray-700'
                                                }
                                            >
                                                {message.content || (
                                                    <span className="inline-flex items-center gap-1">
                                                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />

                                                        <span
                                                            className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                                                            style={{ animationDelay: '100ms' }}
                                                        />

                                                        <span
                                                            className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                                                            style={{ animationDelay: '200ms' }}
                                                        />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="border-t border-gray-200 bg-white px-5 py-5">
                            <form
                                onSubmit={handleSubmit}
                                className="mx-auto max-w-3xl"
                            >
                                <div className="relative rounded-2xl border border-gray-300 bg-white shadow-sm transition focus-within:border-gray-500 focus-within:ring-4 focus-within:ring-gray-100">
                                    <textarea
                                        value={input}
                                        onChange={(event) =>
                                            setInput(event.target.value)
                                        }
                                        onKeyDown={(event) => {
                                            if (
                                                event.key === 'Enter' &&
                                                !event.shiftKey
                                            ) {
                                                event.preventDefault();

                                                if (!loading) {
                                                    event.currentTarget.form?.requestSubmit();
                                                }
                                            }
                                        }}
                                        placeholder="Ask anything about your business..."
                                        rows={1}
                                        disabled={loading}
                                        className="w-full resize-none bg-transparent px-4 pb-14 pt-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
                                    />

                                    <div className="absolute bottom-3 left-4 text-[11px] text-gray-400">
                                        Enter to send · Shift + Enter for new line
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!input.trim() || loading}
                                        className="absolute bottom-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-200"
                                    >
                                        ↑
                                    </button>
                                </div>

                                <p className="mt-3 text-center text-[11px] text-gray-400">
                                    AI can make mistakes. Verify important business information.
                                </p>
                            </form>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

function Suggestion({
    title,
    description,
    onClick,
}: {
    title: string;
    description: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="group rounded-2xl border border-gray-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
        >
            <div className="mb-1 text-sm font-semibold text-gray-800 group-hover:text-gray-950">
                {title}
            </div>

            <div className="text-xs leading-5 text-gray-400">
                {description}
            </div>
        </button>
    );
}