import React, { SetStateAction } from 'react';
import s from './DayTimeline.module.scss';
import { DraggingElement, Interval } from '../../../types';
import classNames from 'classnames/bind';
import {
  IntervalClass,
  isBefore,
  isInIntervals,
  isThereIntersections,
  isEqualDays,
  isNextToOrInIntervals,
} from '../utils';
import { Intervals } from './Intervals';
import { MS_IN_HOUR } from '../../../consts';

const cx = classNames.bind(s);

interface Props {
  resultsIntervals: Interval[];
  adminIntervals: Interval[];
  myIntervals: Interval[];
  day: Date;
  draggingElement: DraggingElement;
  setIntervals: SetStateAction<any>;
  isAdmin?: boolean;
  isResults?: boolean;
}

export const HOURS_IN_CELL = 0.5;
export const HOURS_IN_DAY = 24;
export const AMOUNT_OF_CELLS = Math.round(HOURS_IN_DAY / HOURS_IN_CELL);
export const HEIGHT_OF_CELL = 30;
export const MILLISECONDS_IN_CELL = MS_IN_HOUR * HOURS_IN_CELL;

function DayTimeline(props: Props) {
  const {
    adminIntervals,
    myIntervals,
    day,
    draggingElement,
    setIntervals,
    isAdmin,
    isResults,
    resultsIntervals,
  } = props;

  const isTodayIncludesInterval = ({ start, end }: Interval) =>
    isEqualDays(start, day) ||
    isEqualDays(end, day) ||
    (!isBefore(end, day) && isBefore(start, day));
  const myIntervalsToday = myIntervals.filter(isTodayIncludesInterval);
  const adminIntervalsToday = adminIntervals.filter(isTodayIncludesInterval);
  const resultsIntervalsToday = resultsIntervals.filter(isTodayIncludesInterval);
  const changeableIntervals = isAdmin ? adminIntervals : myIntervals;
  function deleteInterval(id: number) {
    setIntervals(changeableIntervals.filter((interval) => interval.id !== id));
  }
  const mouseCellEnterHandler = (cellDate: Date) => {
    console.log('enter');
    if (!draggingElement.current || isResults) return;
    const { id, part } = draggingElement.current;
    const date = new Date(cellDate.getTime() + (part === 'end' ? MILLISECONDS_IN_CELL : 0));

    if (
      isNextToOrInIntervals(
        changeableIntervals.filter((interval) => interval.id !== id),
        cellDate,
      ) ||
      (!isAdmin && adminIntervals.length && !isInIntervals(adminIntervals, cellDate)) ||
      !draggingElement ||
      (part === 'start' &&
        changeableIntervals.find((el) => el.id === id)!.end.getTime() - date.getTime() <
          MILLISECONDS_IN_CELL) ||
      (part === 'end' &&
        date.getTime() - changeableIntervals.find((el) => el.id === id)!.start.getTime() <
          MILLISECONDS_IN_CELL)
    )
      return;

    const copyOfIntervals = changeableIntervals.slice();
    const interval = copyOfIntervals.find((interval: Interval) => interval.id === id)!;
    interval[part] = date;
    if (!isThereIntersections(copyOfIntervals, interval)) {
      console.log('after');
      setIntervals(copyOfIntervals);
    }
  };
  const onCellClickHandler = (cellDate: Date) => {
    console.log('onMouseDown...');
    if (
      isResults ||
      isNextToOrInIntervals(changeableIntervals, cellDate) ||
      (!isAdmin && adminIntervals.length && !isInIntervals(adminIntervals, cellDate))
    )
      return;
    document.body.style.cursor = 'row-resize';
    const newInterval = new IntervalClass(
      cellDate,
      new Date(cellDate.getTime() + MILLISECONDS_IN_CELL * 2),
    );
    draggingElement.current = { id: newInterval.id, part: 'end' };
    changeableIntervals.push(newInterval);
    setIntervals([...changeableIntervals]);
  };
  const getCellDate = (id: number) =>
    new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(id / 2), (id % 2) * 30);

  return (
    <div className={cx('column')}>
      <div className={cx('inset0')}>
        {Array(AMOUNT_OF_CELLS)
          .fill(null)
          .map((_, id) => {
            const cellDate = getCellDate(id);
            return (
              <div key={id} className={cx('cell')}>
                <div
                  className={cx('inset0')}
                  onTouchStart={() => {
                    mouseCellEnterHandler(cellDate);
                    draggingElement.current = null;
                  }}
                  onMouseEnter={() => mouseCellEnterHandler(cellDate)}
                  onMouseDown={() => {
                    onCellClickHandler(cellDate);
                  }}
                />
              </div>
            );
          })}
      </div>

      {isResults ? (
        <Intervals
          intervals={resultsIntervalsToday}
          color={'#c39bd3'}
          margin={1}
          draggingElement={draggingElement}
          day={day}
        />
      ) : (
        <>
          <Intervals
            intervals={adminIntervalsToday}
            deleteInterval={deleteInterval}
            draggable={!isResults && isAdmin}
            color={'var(--primary-light)'}
            margin={1}
            draggingElement={draggingElement}
            day={day}
          />
          <Intervals
            intervals={myIntervalsToday}
            deleteInterval={deleteInterval}
            draggable={!isAdmin}
            color="var(--success-light)"
            margin={3}
            draggingElement={draggingElement}
            day={day}
          />
        </>
      )}
    </div>
  );
}

export { DayTimeline };