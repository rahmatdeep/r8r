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
    platform: z.enum(["email", "telegram", "gemini", "solana", "gmail"]),
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
    if (data.platform === "gemini") {
      const geminiKeysValidation = z
        .object({
          apiKey: z.string(),
        })
        .safeParse(data.keys);

      if (!geminiKeysValidation.success) {
        ctx.addIssue({
          path: ["keys"],
          message: "Invalid keys for gemini platform",
          code: "custom",
        });
      }
    }
    if (data.platform === "solana") {
      const solanaKeysValidation = z
        .object({
          apiKey: z.string(),
        })
        .safeParse(data.keys);

      if (!solanaKeysValidation.success) {
        ctx.addIssue({
          path: ["keys"],
          message: "Invalid keys for solana platform",
          code: "custom",
        });
      }
    }
    if (data.platform === "gmail") {
      const gmailKeysValidation = z
        .object({
          user: z.string(),
          pass: z.string(),
        })
        .safeParse(data.keys);

      if (!gmailKeysValidation.success) {
        ctx.addIssue({
          path: ["keys"],
          message: "Invalid keys for gmail platform",
          code: "custom",
        });
      }
    }
  });
export type credentialCreateType = z.infer<typeof CredentialCreateSchema>;

export const CredentialDeleteSchema = z.object({
  credentialsId: z.string(),
});

export const GmailCredentialsSchema = z.object({
  platform: z.literal("gmail"),
  keys: z.object({
    user: z.string(),
    pass: z.string(),
  }),
});
export type gmailCredentialsType = z.infer<typeof GmailCredentialsSchema>;

//ACTION METADATA

export const EmailActionMetadataSchema = z.object({
  credentialId: z.string(),
  body: z.string(),
  to: z.string(),
  subject: z.string(),
  from: z.string(),
});
export type emailMetadataType = z.infer<typeof EmailActionMetadataSchema>;

export const TelegramActionMetadataSchema = z.object({
  credentialId: z.string(),
  chatId: z.string(),
  message: z.string(),
});
export type telegramMetadataType = z.infer<typeof TelegramActionMetadataSchema>;
export const GeminiActionMetadataSchema = z.object({
  credentialId: z.string(),
  message: z.string(),
});
export type geminiMetadataType = z.infer<typeof GeminiActionMetadataSchema>;

export const SolanaMetadataSchema = z.object({
  credentialId: z.string(),
  to: z.string(),
  amount: z.string(),
});
export type solanaMetadataType = z.infer<typeof SolanaMetadataSchema>;

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
export const GeminiCredentialsSchema = z.object({
  platform: z.literal("gemini"),
  keys: z.object({
    apiKey: z.string(),
  }),
});
export type geminiCredentialsType = z.infer<typeof TelegramCredentialsSchema>;
export const SolanaCredentialsSchema = z.object({
  platform: z.literal("solana"),
  keys: z.object({
    apiKey: z.string(),
  }),
});
export type solanaCredentialsType = z.infer<typeof SolanaCredentialsSchema>;

export const CredentialUpdateSchema = z
  .object({
    credentialsId: z.string(),
    title: z.string().optional(),
    platform: z.enum(["email", "telegram", "gemini", "solana", "gmail"]),
    keys: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.keys !== undefined) {
      if (data.platform === "email") {
        const emailKeysValidation = z
          .object({ apiKey: z.string() })
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
          .object({ apiKey: z.string() })
          .safeParse(data.keys);
        if (!telegramKeysValidation.success) {
          ctx.addIssue({
            path: ["keys"],
            message: "Invalid keys for telegram platform",
            code: "custom",
          });
        }
      }
      if (data.platform === "gemini") {
        const geminiKeysValidation = z
          .object({ apiKey: z.string() })
          .safeParse(data.keys);
        if (!geminiKeysValidation.success) {
          ctx.addIssue({
            path: ["keys"],
            message: "Invalid keys for gemini platform",
            code: "custom",
          });
        }
      }
      if (data.platform === "solana") {
        const solanaKeysValidation = z
          .object({ apiKey: z.string() })
          .safeParse(data.keys);
        if (!solanaKeysValidation.success) {
          ctx.addIssue({
            path: ["keys"],
            message: "Invalid keys for solana platform",
            code: "custom",
          });
        }
      }
      if (data.platform === "gmail") {
        const gmailKeysValidation = z
          .object({ user: z.string(), pass: z.string() })
          .safeParse(data.keys);
        if (!gmailKeysValidation.success) {
          ctx.addIssue({
            path: ["keys"],
            message: "Invalid keys for gmail platform",
            code: "custom",
          });
        }
      }
    }
  });

export type credentialUpdateType = z.infer<typeof CredentialUpdateSchema>;

export const PLATFORMS = ["email", "telegram", "gemini", "solana", "gmail"] as const;
export type Platform = typeof PLATFORMS[number];