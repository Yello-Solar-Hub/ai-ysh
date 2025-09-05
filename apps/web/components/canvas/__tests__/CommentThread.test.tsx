import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentThread } from '../CommentThread';

describe('CommentThread', () => {
  afterEach(() => cleanup());

  it('supports CRUD operations', async () => {
    render(<CommentThread threadId="t1" currentUser="alice" />);

    const input = screen.getByRole('textbox', { name: /add comment/i });
    await userEvent.type(input, 'Hello @bob');
    await userEvent.click(
      screen.getByRole('button', { name: /add comment/i }),
    );
    expect(screen.getByText(/Hello/)).toBeTruthy();
    expect(screen.getByTestId('mention').textContent).toBe('@bob');
    expect(document.activeElement).toBe(input);

    await userEvent.click(
      screen.getByRole('button', { name: /edit comment/i }),
    );
    const editInput = screen.getByLabelText(/edit comment/i);
    expect(document.activeElement).toBe(editInput);
    await userEvent.clear(editInput);
    await userEvent.type(editInput, 'Edited');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(screen.getByText('Edited')).toBeTruthy();

    await userEvent.click(screen.getByRole('button', { name: /delete comment/i }));
    expect(screen.queryByText('Edited')).toBeNull();
  });

  it('resolves thread and respects filter', async () => {
    const { rerender } = render(
      <CommentThread threadId="t2" currentUser="alice" />,
    );
    await userEvent.type(
      screen.getByRole('textbox', { name: /add comment/i }),
      'hi',
    );
    await userEvent.click(
      screen.getByRole('button', { name: /add comment/i }),
    );
    await userEvent.click(screen.getByRole('button', { name: /resolve thread/i }));
    expect(screen.getByText(/resolved/)).toBeTruthy();

    rerender(<CommentThread threadId="t2" currentUser="alice" filter="open" />);
    expect(screen.queryByRole('list')).toBeNull();

    rerender(
      <CommentThread threadId="t2" currentUser="alice" filter="resolved" />,
    );
    expect(screen.getByRole('list')).toBeTruthy();
  });
});
