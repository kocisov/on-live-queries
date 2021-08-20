import {User} from "@prisma/client";
import {builder} from "../builder";
import {ItemObject} from "./ItemResolver";

export const UserObject = builder.objectRef<User>("User");

UserObject.implement({
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    items: t.field({
      type: [ItemObject],
      resolve: async (user, _args, context) => {
        return context.prisma.item.findMany({
          where: {
            userId: user.id,
          },
        });
      },
    }),
    createdAt: t.expose("createdAt", {type: "DateTime"}),
    updatedAt: t.expose("updatedAt", {type: "DateTime"}),
  }),
});

builder.queryType({
  fields: (t) => ({
    users: t.field({
      type: [UserObject],
      resolve: async (_root, _args, context) => {
        return context.prisma.user.findMany();
      },
    }),
  }),
});
