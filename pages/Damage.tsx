import React, { useState } from "react";
import {
  AppShell,
  Box,
  Center,
  Checkbox,
  Container,
  Divider,
  Header,
  Navbar,
  NumberInput,
  Paper,
  Space,
  Stack,
  Title,
  TextInput,
  Switch,
  Group,
  ActionIcon,
  Text,
  Button,
  Code,
} from "@mantine/core";
import { useForm, formList } from "@mantine/form";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { GripVertical, Trash } from "tabler-icons-react";
import DamagerCard from "../components/DamagerCard/DamagerCard";
import DamageGraphs from "../components/DamageGraphs";
import PlayerCard, { Player } from "../components/DamagerCard/PlayerCard";

const Damage = () => {
  const form = useForm({
    initialValues: {
      attacks: formList([
        { name: "Eldritch Blast", damage: "1d8+20" },
        // { name: 'Bill Love', damage: 'bill@mantine.dev' },
        // { name: 'Nancy Eagle', damage: 'nanacy@mantine.dev' },
        // { name: 'Lim Notch', damage: 'lim@mantine.dev' },
        // { name: 'Susan Seven', damage: 'susan@mantine.dev' }
      ]),
    },
  });

  const [playerList, setPlayerList] = useState<{ [key: number]: Player }>({
    0: {
      attackBonus: 7,
      spellSaveDC: 14,
      id: 0,
      elvenAccuracy: false,
      battleMaster: false,
    },
  });

  // const fields = form.values.attacks.map((_, index) => (
  // <Draggable key={index} index={index} draggableId={index.toString()}>
  //   {(provided) => (
  //     <Group ref={provided.innerRef} mt='xs' {...provided.draggableProps}>
  //       <Center {...provided.dragHandleProps}>
  //         <GripVertical size={18} />
  //       </Center>
  //       <TextInput
  //         placeholder='John Doe'
  //         {...form.getListInputProps('attacks', index, 'name')}
  //       />
  //       <TextInput
  //         placeholder='example@mail.com'
  //         {...form.getListInputProps('attacks', index, 'damage')}
  //       />
  //       <ActionIcon
  //         color="red"
  //         variant="hover"
  //         onClick={() => form.removeListItem('attacks', index)}
  //       >
  //         <Trash size={16} />
  //       </ActionIcon>
  //     </Group>
  //   )}
  // </Draggable>
  // ));
  return (
    <AppShell
      padding="md"
      navbar={
        <Navbar width={{ base: 300 }} height={500} p="xs">
          <Box px={"2px"}>
            Basic Information
            <Navbar.Section>
              {/*<Title order={4}>PC Info</Title>*/}
              {/*<NumberInput label={'Attack Bonus'} step={1} />*/}
              {/*<NumberInput label={'Spell Save'} step={1} />*/}
            </Navbar.Section>
            <Space h={"md"} />
            {/*<Divider pt={"3px"} size={"sm"}/>*/}3
            <Navbar.Section>
              <Title order={4}>Special</Title>
              <Checkbox label={"Elven Accuracy"} />
              <Checkbox label={"Lucky"} />
            </Navbar.Section>
          </Box>
        </Navbar>
      }
      aside={<DamageGraphs />}
      header={
        <Header height={60} p="xs">
          <Title> Damage Calcs :)</Title>
        </Header>
      }
    >
      <Container px={"md"}>
        {/*<Paper>*/}
        <Title order={3}>Attacks</Title>
        <Space h={3} />
        {Object.entries(playerList).map((p, index) => (
          <PlayerCard
            key={index}
            player={playerList[index]}
            setPlayer={(p) => setPlayerList({ ...playerList, [index]: p })}
          />
        ))}
        {/*<Box sx={{ maxWidth: 700 }}  mx={'md'}>*/}
        {/*  {fields.length > 0 ? (*/}
        {/*    <Group mb='xs'>*/}
        {/*      <Text weight={500} size='sm' pl={35} >*/}
        {/*        Name*/}
        {/*      </Text>*/}

        {/*      <Text weight={500} size='sm' pl={150} >*/}
        {/*        Damage*/}
        {/*      </Text>*/}
        {/*    </Group>*/}
        {/*  ) : (*/}
        {/*    <Text color='dimmed' align='center'>*/}
        {/*      Empty :)*/}
        {/*    </Text>*/}
        {/*  )}*/}

        {/*  <DragDropContext*/}
        {/*    onDragEnd={({ destination, source }) =>*/}
        {/*      form.reorderListItem('employees', { from: source.index, to: destination.index })*/}
        {/*    }*/}
        {/*  >*/}
        {/*    <Droppable droppableId='dnd-list' direction='vertical'>*/}
        {/*      {(provided) => (*/}
        {/*        <div {...provided.droppableProps} ref={provided.innerRef}>*/}
        {/*          {fields}*/}
        {/*          {provided.placeholder}*/}
        {/*        </div>*/}
        {/*      )}*/}
        {/*    </Droppable>*/}
        {/*  </DragDropContext>*/}

        {/*  <Group position='center' mt='md'>*/}
        {/*    <Button onClick={() => form.addListItem('employees', { name: '', email: '' })}>*/}
        {/*      Add employee*/}
        {/*    </Button>*/}
        {/*  </Group>*/}

        {/*  <Text size='sm' weight={500} mt='md'>*/}
        {/*    Form values:*/}
        {/*  </Text>*/}
        {/*  <Code block>{JSON.stringify(form.values, null, 2)}</Code>*/}
        {/*</Box>*/}

        {/*</Paper>*/}
      </Container>
    </AppShell>
  );
};

export default Damage;
