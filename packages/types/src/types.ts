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

export const CredentialCreateSchema = z.object({
  title: z.string(),
  platform: z.enum(["email", "telegram"]),
  keys: z.any(), // Initially allow any structure for `keys`
}).superRefine((data, ctx) => {
  if (data.platform === "email") {
    const emailKeysValidation = z.object({
      apiKey: z.string(), // Validate that `keys` contains an `apiKey`
    }).safeParse(data.keys);

    if (!emailKeysValidation.success) {
      ctx.addIssue({
        path: ["keys"],
        message: "Invalid keys for email platform",
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

//CREDENTIALS
export const EmailCredentialsSchema = z.object({
  platform: "email",
  keys: {
    apiKey: z.string(),
  },
});
export type emailCredentialsType = z.infer<typeof EmailCredentialsSchema>;
