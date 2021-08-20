import {Item} from "@prisma/client";
import {builder} from "../builder";
import {UserObject} from "./UserResolver";

export const ItemObject = builder.objectRef<Item>("Item");

ItemObject.implement({
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    description: t.exposeString("description", {nullable: true}),
    user: t.field({
      type: UserObject,
      resolve: async (item, _args, context) => {
        return context.prisma.user.findUnique({
          rejectOnNotFound: true,
          where: {
            id: item.userId,
          },
        });
      },
    }),
    createdAt: t.expose("createdAt", {type: "DateTime"}),
    updatedAt: t.expose("updatedAt", {type: "DateTime"}),
  }),
});
