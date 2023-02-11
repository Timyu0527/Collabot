import { Client, Collection, Events } from 'discord.js'
import { createBoard, getBoard } from './service/board'
import { createBoardModal } from './modal/board'
import { SlashCommand } from './types/command'
import { createBoardSelectMenu } from './menu/board'
import { List } from './types/model/board'
import { createBoardEmbed } from './embed/board'

export function setBotListener(client: Client, commandList: Array<SlashCommand>) {
  const commands = new Collection<string, SlashCommand>(commandList.map((c) => [c.data.name, c]))

  client.once(Events.ClientReady, () => {
    console.log('Bot Ready!')
  })

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isStringSelectMenu()) return
    if (interaction.customId == 'boardMenu') {
      await interaction.deferReply()
      const board: { name: string, Lists: Array<List> } = await getBoard(interaction)
      const boardEmbed = await createBoardEmbed(board)
      await interaction.editReply({ embeds: [boardEmbed] })
    }
  })

  client.on(Events.InteractionCreate, async (interaction) => {
    const wait = (ms: number) => {
      return new Promise(async resolve => {
        setTimeout(resolve, ms);
      })
    }
    if (!interaction.isModalSubmit()) return
    if (interaction.customId === "newBoardModal")
      await createBoard(interaction)
    if (interaction.isModalSubmit() && interaction.customId == "myModal") {
      try {
        console.log(interaction)
        await interaction.reply({ content: '創建成功!' });
      } catch (error) {
        await interaction.reply({ content: '發生了一個錯誤，無法添加頻道' })
        console.log(error)
      }
    }
    const maxTimeWait = 2000000000
    if (interaction.isModalSubmit() && interaction.customId == "alarm.countdown") {
      try {
        let time: Array<string> = interaction.fields.getTextInputValue('time').split(":")
        let timestamp = new Array<number>()
        time.forEach((value: string) => {
          timestamp.push(Number(value))
        })
        let totalTime = (timestamp[0] * 3600 + timestamp[1] * 60 + timestamp[2]) * 1000
        if (totalTime < 0)
          await interaction.reply({ content: `這段時間已經過去了!請輸入正常時間!` });
        else {
          await interaction.reply({ content: `在${interaction.fields.getTextInputValue('time')}後提醒 ${interaction.fields.getTextInputValue('mes')}` });
          while (totalTime > maxTimeWait) {
            await (wait(maxTimeWait))
            totalTime -= maxTimeWait
          }
          await (wait(totalTime))
          if (interaction.guildId == null) {
            await interaction.user.send(`@everyone 😃 ${interaction.fields.getTextInputValue('mes')}`);
          } else {
            await interaction.channel?.send(`@everyone 😃 ${interaction.fields.getTextInputValue('mes')}`);
          }
        }
      }
      catch (error) {
        await interaction.reply({ content: `錯誤 請稍後在試!` });
        console.log(error)
      }
    }
    if (interaction.isModalSubmit() && interaction.customId == "alarm.notify") {
      try {
        let time: Array<string> = interaction.fields.getTextInputValue('time').split(":")
        let timestamp = new Array<number>()
        time.forEach((value: string) => {
          timestamp.push(Number(value))
        })
        let alarm = new Date(timestamp[0], timestamp[1] - 1, timestamp[2], timestamp[3], timestamp[4], timestamp[5])
        let totalTime = alarm.getTime() - new Date().getTime()
        if (totalTime < 0)
          await interaction.reply({ content: `這段時間已經過去了!請輸入正常時間!` });
        else {
          await interaction.reply({ content: `在${interaction.fields.getTextInputValue('time')}時提醒 ${interaction.fields.getTextInputValue('mes')}` });
          while (totalTime > maxTimeWait) {
            await (wait(maxTimeWait))
            totalTime -= maxTimeWait
          }
          await (wait(totalTime))
          if (interaction.guildId == null) {
            await interaction.user.send(`@everyone 😃 ${interaction.fields.getTextInputValue('mes')}`);
          } else {
            await interaction.channel?.send(`@everyone 😃 ${interaction.fields.getTextInputValue('mes')}`);
          }
        }
      } catch (error) {
        await interaction.reply({ content: `錯誤 請稍後在試!` });
        console.log(error)
      }
    }
    // await interaction.reply('Your submission was received successfully!')
  })

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return
    const command = commands.get(interaction.commandName)
    if (!command) return
    if (interaction.commandName == 'board') {
      const subcommand = interaction.options.getSubcommand()
      if (subcommand == 'create') {
        createBoardModal(interaction)
      }
      else if (subcommand == 'get') {
        createBoardSelectMenu(interaction)
      }
    }

    try {
      await command.execute(interaction)
    } catch (error) {
      console.error(error)
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true
      })
    }
  })

  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton() && interaction.customId == "food.order.accept") {
      let userId = interaction.user.id
      console.log("clicked")
      if (interaction.channel == null) return
      await interaction.channel.send(':middle_finger:')
    } else if (interaction.isButton() && interaction.customId == "food.order.result") {
      let userId = interaction.user.id
      console.log("clicked")
      if (interaction.channel == null) return
      await interaction.channel.send(':middle_finger:')
    }
    if (interaction.isButton() && interaction.customId == "close") {
      try {
        interaction.channel?.delete()
      } catch (error) {
        console.log(error)
      }
    }

  })
}

