"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { NoteTag } from "@/types/note";
import css from "./NoteForm.module.css";

interface NoteFormProps {
  onSubmit: (note: { title: string; content: string; tag: NoteTag }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function NoteForm({
  onSubmit,
  onCancel,
  isSubmitting,
}: NoteFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState<NoteTag>("Todo");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !content.trim()) return;

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      tag,
    });
  };

  return (
    <form className={css.form} onSubmit={handleSubmit}>
      <label className={css.label} htmlFor="title">
        Title
      </label>
      <input
        className={css.input}
        id="title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
      />

      <label className={css.label} htmlFor="content">
        Content
      </label>
      <textarea
        className={css.textarea}
        id="content"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        required
      />

      <label className={css.label} htmlFor="tag">
        Tag
      </label>
      <select
        className={css.select}
        id="tag"
        value={tag}
        onChange={(event) => setTag(event.target.value as NoteTag)}
      >
        <option value="Todo">Todo</option>
        <option value="Work">Work</option>
        <option value="Personal">Personal</option>
        <option value="Meeting">Meeting</option>
        <option value="Shopping">Shopping</option>
      </select>

      <div className={css.actions}>
        <button className={css.cancelButton} type="button" onClick={onCancel}>
          Cancel
        </button>

        <button
          className={css.submitButton}
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create note"}
        </button>
      </div>
    </form>
  );
}
