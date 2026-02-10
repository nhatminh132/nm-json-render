import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

export const catalog = defineCatalog(schema, {
  components: {
    Card: {
      props: z.object({
        title: z.string(),
        description: z.string().nullable(),
      }),
      slots: ["default"],
      description: "A card container with title and description",
    },
    Button: {
      props: z.object({
        label: z.string(),
        variant: z.enum(["primary", "secondary", "outline"]).nullable(),
      }),
      description: "A clickable button",
    },
    Input: {
      props: z.object({
        label: z.string(),
        placeholder: z.string().nullable(),
        name: z.string(),
      }),
      description: "Text input field",
    },
    Text: {
      props: z.object({
        content: z.string(),
        size: z.enum(["sm", "md", "lg"]).nullable(),
      }),
      description: "Display text content",
    },
  },
  actions: {
    submit: { description: "Submit the form" },
    reset: { description: "Reset the form" },
    notify: { description: "Show a notification" },
  },
});
