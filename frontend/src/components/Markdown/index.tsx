import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import './styles.scss';

interface MarkdownProps {
    children: string;
}

export const Markdown = memo(({ children }: MarkdownProps) => {
    return (
        <div className="markdown-body">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                    code({ className, children, ...props }) {
                        const isInline = !className;
                        if (isInline) {
                            return (
                                <code className="inline-code" {...props}>
                                    {children}
                                </code>
                            );
                        }
                        return (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    },
                    pre({ children, ...props }) {
                        return (
                            <div className="code-block-wrapper">
                                <pre {...props}>{children}</pre>
                            </div>
                        );
                    },
                }}
            >
                {children}
            </ReactMarkdown>
        </div>
    );
});

Markdown.displayName = 'Markdown';