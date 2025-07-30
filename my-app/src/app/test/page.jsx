'use client';
import React, { useState } from 'react';
import BookingModal from '@/app/components/bookingModal';

const BookingConfirmationPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Mock data: replace this with actual data from your backend or state
  const pgDetails = {
    name: 'Sunshine PG',
  };

  const bookingStatus = {
    status: 'confirmed', // try 'rejected' or any other value to test different states
    rejectionReason: '', // show something here if status is rejected
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <BookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        pgDetails={pgDetails}
        bookingStatus={bookingStatus}
      />
    </div>
  );
};

export default BookingConfirmationPage;
