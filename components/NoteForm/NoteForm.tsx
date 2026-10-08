"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createNote } from "@/lib/api";
import type { NoteTag } from "@/types/note";
import css from "./NoteForm.module.css";

interface NoteFormProps {
  onCancel: () => void;
}

interface NoteFormValues {
  title: string;
  content: string;
  tag: NoteTag;
}

const initialValues: NoteFormValues = {
  title: "",
  content: "",
  tag: "Todo",
};

const validationSchema = Yup.object({
  title: Yup.string()
    .trim()
    .min(3, "Title must contain at least 3 characters")
    .max(50, "Title must contain at most 50 characters")
    .required("Title is required"),

  content: Yup.string()
    .trim()
    .max(500, "Content must contain at most 500 characters")
    .notRequired(),

  tag: Yup.string()
    .oneOf(["Todo", "Work", "Personal", "Meeting", "Shopping"])
    .required("Tag is required"),
});

export default function NoteForm({ onCancel }: NoteFormProps) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notes"],
      });
      onCancel();
    },
  });

  return (
    <Formik<NoteFormValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        createMutation.mutate({
          title: values.title.trim(),
          content: values.content.trim(),
          tag: values.tag,
        });
      }}
    >
      <Form className={css.form}>
        <label className={css.label} htmlFor="title">
          Title
        </label>
        <Field className={css.input} id="title" name="title" type="text" />
        <ErrorMessage name="title" component="p" />

        <label className={css.label} htmlFor="content">
          Content
        </label>
        <Field
          as="textarea"
          className={css.textarea}
          id="content"
          name="content"
        />
        <ErrorMessage name="content" component="p" />

        <label className={css.label} htmlFor="tag">
          Tag
        </label>
        <Field as="select" className={css.select} id="tag" name="tag">
          <option value="Todo">Todo</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Meeting">Meeting</option>
          <option value="Shopping">Shopping</option>
        </Field>
        <ErrorMessage name="tag" component="p" />

        {createMutation.isError && (
          <p>Could not create note. Please try again.</p>
        )}

        <div className={css.actions}>
          <button
            className={css.cancelButton}
            type="button"
            onClick={onCancel}
            disabled={createMutation.isPending}
          >
            Cancel
          </button>

          <button
            className={css.submitButton}
            type="submit"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Creating..." : "Create note"}
          </button>
        </div>
      </Form>
    </Formik>
  );
}
