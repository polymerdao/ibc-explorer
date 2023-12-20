'use client';
import React, { useState, ChangeEvent } from 'react';

interface DateTimeRangePickerProps {
  onRangeChange: (newStartDate: Date, newEndDate: Date) => void;
}

const formatToDateTimeLocalString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const DateTimeRangePicker: React.FC<DateTimeRangePickerProps> = ({ onRangeChange }) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

  const [startDate, setStartDate] = useState<Date | null>(startOfDay);
  const [endDate, setEndDate] = useState<Date | null>(now);

  const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setStartDate(new Date(newStartDate));
    onRangeChange(new Date(newStartDate), endDate || new Date());
  };

  const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setEndDate(new Date(newEndDate));
    onRangeChange(startDate || new Date(), new Date(newEndDate));
  };

  return (
    <div className="my-4 p-4 border rounded-md shadow-md max-w-sm">
      <label className="block text-sm font-medium text-gray-700" htmlFor="startDateTime">
        Start Date and Time:
      </label>
      <input
        type="datetime-local"
        id="startDateTime"
        name="startDateTime"
        value={startDate ? formatToDateTimeLocalString(startDate) : ''}
        onChange={handleStartDateChange}
        className="mt-1 p-2 border rounded-md w-full"
      />

      <label className="block mt-4 text-sm font-medium text-gray-700" htmlFor="endDateTime">
        End Date and Time:
      </label>
      <input
        type="datetime-local"
        id="endDateTime"
        name="endDateTime"
        value={endDate ? formatToDateTimeLocalString(endDate) : ''}
        onChange={handleEndDateChange}
        className="mt-1 p-2 border rounded-md w-full"
      />
    </div>
  );
};

export default DateTimeRangePicker;
