import type { NextPage } from 'next';
import Head from 'next/head';
import { Calendar } from '../components/Calendar';
import { useRef, useState } from 'react';
import { eventsPost, getDateOfMonday, loginPost } from '../utils';
import s from '../styles/index.module.scss';
import { Button } from '../components/Button';
import { MS_IN_DAY } from '../consts';
import { Input } from '../components/Input';
import { WeekSlider } from '../components/WeekSlider/WeekSlider';
import { Dialog } from '../components/Dialog';
import { useInput } from '../customHooks';
import { useCallback } from 'react';
import { Copyboard } from '../components/Copyboard/Copyboard';

const Home: NextPage = () => {
  const [adminIntervals, setAdminIntervals] = useState([]);
  const [myIntervals, setMyIntervals] = useState([]);
  const [resultsIntervals, setResultsIntervals] = useState([]);
  const [dateOfMonday, setDateOfMonday] = useState(getDateOfMonday(new Date()));
  const [isResults, setIsResults] = useState(false);
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  // const [isTitleError, setIsTitleError] = useState(false);
  // const [isNameError, setIsNameError] = useState(false);
  const name = useInput('');
  const titleInput = useInput('');
  const draggingElement = useRef(null);
  const isAdmin = true;
  function previousWeek() {
    setDateOfMonday(new Date(dateOfMonday.getTime() - MS_IN_DAY * 7));
  }

  function nextWeek() {
    setDateOfMonday(new Date(dateOfMonday.getTime() + MS_IN_DAY * 7));
  }

  async function createEvent() {
    console.log(name.value);
    // if (!name.value||!titleInput.value) return
    loginPost({ name: name.value });
    const event = await eventsPost({
      title: titleInput.value,
      description: '',
    });
    const locationArray = event.split('/');
    console.log(locationArray[locationArray.length - 1]);
    setIsResults(true);
  }

  async function saveIntervals() {}

  async function goToResults() {
    setIsResults(true);
  }

  async function goToVoting() {
    setIsResults(false);
  }

  const propsForCalendar = {
    resultsIntervals,
    adminIntervals,
    myIntervals,
    draggingElement,
    dateOfMonday,
    setIntervals: isAdmin ? setAdminIntervals : setMyIntervals,
    isAdmin,
    isResults,
  };
  return (
    <div className={s.window}>
      <Head>
        <title>Time Manager</title>
      </Head>
      <div className={s.header}>
        <WeekSlider right={nextWeek} left={previousWeek} date={dateOfMonday} />
        {!isAdmin ? (
          <h1>{titleInput.value}</h1>
        ) : (
          <Input {...titleInput.bind} placeholder="введите название события" />
        )}
        <div>
          <Buttons
            isAdmin={isAdmin}
            isResults={isResults}
            name={name}
            goToVoting={goToVoting}
            goToResults={goToResults}
            saveIntervals={saveIntervals}
            createEvent={createEvent}
            setIsInputModalOpen={setIsInputModalOpen}
            isInputModalOpen={isInputModalOpen}
          />
        </div>
      </div>
      <Calendar {...propsForCalendar} />
    </div>
  );
};
const Buttons = ({
  isResults,
  isAdmin,
  name,
  createEvent,
  goToVoting,
  goToResults,
  saveIntervals,
  isInputModalOpen,
  setIsInputModalOpen,
}: any) => {
  if (isAdmin) {
    return (
      <div>
        <Button onClick={() => setIsInputModalOpen(true)}>создать событие</Button>
        <Dialog close={() => setIsInputModalOpen(false)} open={isInputModalOpen}>
          {!isResults ? (
            <>
              <br />
              <Input style={{ width: '100%' }} {...name.bind} placeholder="введите имя" />
              <br />
              <Button onClick={createEvent} style={{ width: '100%' }}>
                сохранить
              </Button>
            </>
          ) : (
            <>
              <br />
              <Copyboard url={'pornhub.com'} />
            </>
          )}
        </Dialog>
      </div>
    );
  } else {
    if (isResults) {
      return <Button onClick={goToVoting}>к голосованию</Button>;
    } else {
      return (
        <>
          <Button onClick={goToResults}>Результаты</Button>
          <Button onClick={saveIntervals}>Сохранить</Button>
        </>
      );
    }
  }
};
export default Home;
