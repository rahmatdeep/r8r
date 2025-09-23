import { z } from "zod";

export const SignupSchema = z.object({
  email: z.string().min(5),
  password: z.string().min(6),
  name: z.string().min(3),
});

export const SigninSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export const WorkflowCreateSchema = z.object({
  id: z.string(),
  availableTriggerId: z.string(),
  title: z.string(),
  triggerMetadata: z.any().optional(),
  actions: z.array(
    z.object({
      availableActionId: z.string(),
      actionMetadata: z.any().optional(),
    })
  ),
});

export const WorkflowUpdateSchema = z.object({
  availableTriggerId: z.string(),
  title: z.string(),
  triggerMetadata: z.any().optional(),
  actions: z.array(
    z.object({
      availableActionId: z.string(),
      actionMetadata: z.any().optional(),
    })
  ),
});

// export const CredentialCreateSchema = z.object({
//   title: z.string(),
//   platform: z.enum(["email", "telegram"]),
//   keys: z.json(),
// });

export const CredentialCreateSchema = z
  .object({
    title: z.string(),
    platform: z.enum(["email", "telegram"]),
    keys: z.any(),
  })
  .superRefine((data, ctx) => {
    if (data.platform === "email") {
      const emailKeysValidation = z
        .object({
          apiKey: z.string(),
        })
        .safeParse(data.keys);

      if (!emailKeysValidation.success) {
        ctx.addIssue({
          path: ["keys"],
          message: "Invalid keys for email platform",
          code: "custom",
        });
      }
    }
    if (data.platform === "telegram") {
      const telegramKeysValidation = z
        .object({
          apiKey: z.string(),
        })
        .safeParse(data.keys);

      if (!telegramKeysValidation.success) {
        ctx.addIssue({
          path: ["keys"],
          message: "Invalid keys for telegram platform",
          code: "custom",
        });
      }
    }
  });

export const CredentialDeleteSchema = z.object({
  credentialsId: z.string(),
});

//ACTION METADATA

export const EmailActionMetadataSchema = z.object({
  body: z.string(),
  to: z.string(),
  subject: z.string(),
  from: z.string(),
});
export type emailMetadataType = z.infer<typeof EmailActionMetadataSchema>;

export const TelegramActionMetadataSchema = z.object({
  chatId: z.string(), // `chatId` is now part of the metadata
  message: z.string(), // The message to send
});
export type telegramMetadataType = z.infer<typeof TelegramActionMetadataSchema>;

//CREDENTIALS
export const EmailCredentialsSchema = z.object({
  platform: z.literal("email"),
  keys: {
    apiKey: z.string(),
  },
});
export type emailCredentialsType = z.infer<typeof EmailCredentialsSchema>;

export const TelegramCredentialsSchema = z.object({
  platform: z.literal("telegram"),
  keys: z.object({
    apiKey: z.string(),
  }),
});
export type telegramCredentialsType = z.infer<typeof TelegramCredentialsSchema>;
