#!/bin/bash
sed -i '/registeredUsers\[userId\] = {/,/};/c\
            registeredUsers[userId] = {\
              username: state.data.username,\
              wa: state.data.wa,\
              pin: state.data.pin\
            };\
            members.push({\
              id: `MBR-${userId}`,\
              name: state.data.username,\
              whatsapp: state.data.wa,\
              telegram: ctx.from.username ? `@${ctx.from.username}` : `ID:${userId}`,\
              balance: 0,\
              type: "Biasa"\
            });' server.ts
