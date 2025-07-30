'use client';

import { useState, useEffect } from 'react';
import { IoSearchCircle } from 'react-icons/io5';
import { useSession } from 'next-auth/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import 'react-tooltip/dist/react-tooltip.css';
import 'react-toastify/dist/ReactToastify.css';

const BookingModal = dynamic(() => import('./bookingModal'), {
  ssr: false,
});

function FetchPgDetails() {
  const { data: session } = useSession();
  const router = useRouter();
  const [city, setCity] = useState('');
  const [selectedSharing, setSelectedSharing] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedRent, setSelectedRent] = useState('');
  const [pgList, setPgList] = useState([]);
  const [bookingStatus, setBookingStatus] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPgDetails, setModalPgDetails] = useState(null);
  const [modalBookingStatus, setModalBookingStatus] = useState(null);
  const [hasCompletedPayment, setHasCompletedPayment] = useState(false);

  const handleChange = (e) => setCity(e.target.value);
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleSharingChange = (value) => {
    setSelectedSharing((prev) => (prev === value ? '' : value));
  };
  const handleGenderChange = (value) => {
    setSelectedGender((prev) => (prev === value ? '' : value));
  };
  const handleRentChange = (value) => {
    setSelectedRent((prev) => (prev === value ? '' : value));
  };

  const fetchData = async () => {
    const formattedCity =
      city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    const requestBody = { city: formattedCity };

    if (selectedSharing) requestBody.sharing = selectedSharing;
    if (selectedGender) requestBody.gender = selectedGender;
    if (selectedRent) requestBody.rent = selectedRent;
    requestBody.availability = true;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/pg`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      setPgList(data.data || []);
    } catch (err) {
      console.log('Error fetching details', err);
      toast.error('Failed to fetch PG details. Please try again.');
    }
  };

  const fetchBookingStatus = async (pgId) => {
    try {
      const user = session?.user?.id;
      if (!user) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/booking-status/${user}/${pgId}`);
      const data = await res.json();

      if (res.ok && data.status) {
        setBookingStatus((prevStatus) => ({
          ...prevStatus,
          [pgId]: {
            bookingId: data.bookingId,
            status: data.status,
            rejectionReason: data.rejectionReason,
          },
        }));
      } else {
        setBookingStatus((prevStatus) => ({
          ...prevStatus,
          [pgId]: null,
        }));
      }
    } catch (err) {
      console.error('Error fetching booking status:', err);
    }
  };

  const checkCompletedPayment = async () => {
    try {
      const user = session?.user?.id;
      if (!user) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/has-completed-payment/${user}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await res.json();
      setHasCompletedPayment(data.hasCompletedPayment || false);
    } catch (err) {
      console.error('Error checking completed payment:', err);
      toast.error('Failed to check payment status. Please try again.');
    }
  };

  const handleBooking = async (pg) => {
    if (!session || session.user.role !== 'user') {
      toast.warning('To book the PG, sign up as a user first.');
      setTimeout(() => {
        router.push('/signup');
      }, 2000);
      return;
    }

    const currentStatus = bookingStatus[pg._id];

    if (currentStatus) {
      setModalPgDetails(pg);
      setModalBookingStatus(currentStatus);
      setIsModalOpen(true);
      return;
    }

    try {
      const res = await fetch('${process.env.NEXT_PUBLIC_BACKEND_URL}/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ pg }),
      });

      const data = await res.json();

      if (res.ok) {
        const newStatus = { status: 'pending', bookingId: data.bookingId };
        setBookingStatus((prevStatus) => ({
          ...prevStatus,
          [pg._id]: newStatus,
        }));
        setModalPgDetails(pg);
        setModalBookingStatus(newStatus);
        setIsModalOpen(true);
        fetchBookingStatus(pg._id);
      } else {
        const errorStatus = {
          status: 'rejected',
          rejectionReason: data.rejectionReason || 'Booking failed.',
        };
        setBookingStatus((prevStatus) => ({
          ...prevStatus,
          [pg._id]: errorStatus,
        }));
        setModalPgDetails(pg);
        setModalBookingStatus(errorStatus);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error('Error booking PG:', err);
      const errorStatus = {
        status: 'rejected',
        rejectionReason: 'Booking failed due to an error.',
      };
      setBookingStatus((prevStatus) => ({
        ...prevStatus,
        [pg._id]: errorStatus,
      }));
      setModalPgDetails(pg);
      setModalBookingStatus(errorStatus);
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSharing, selectedGender, selectedRent]);

  useEffect(() => {
    if (session?.user?.id) {
      pgList.forEach((pg) => {
        fetchBookingStatus(pg._id);
      });
      checkCompletedPayment();
    }
  }, [pgList, session]);

  const sharingOptions = ['Single', 'Double', 'Triple', 'Quad', 'Bunk Bed'];
  const genderOptions = ['Boys', 'Girls'];
  const rentOptions = [
    '<5000',
    '5000-10000',
    '10000-15000',
    '15000-20000',
    '20000+',
  ];

  const availablePgList = pgList.filter((pg) => pg.availability === true);

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 pt-20 bg-[var(--color-background)] min-h-screen transition-colors duration-500">
      {/* Filter Panel */}
      <div className="md:w-1/4 w-full bg-white p-4 rounded-xl shadow-md border border-teal-300 h-fit">
        <h3 className="text-lg font-semibold mb-4 text-teal-600">Filter by Sharing</h3>
        <div className="space-y-3">
          {sharingOptions.map((option) => (
            <label key={option} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={option}
                checked={selectedSharing === option}
                onChange={() => handleSharingChange(option)}
                className="text-teal-600 focus:ring-teal-500"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-4 text-teal-600">Filter by Gender</h3>
        <div className="space-y-3">
          {genderOptions.map((option) => (
            <label key={option} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={option}
                checked={selectedGender === option}
                onChange={() => handleGenderChange(option)}
                className="text-teal-600 focus:ring-teal-500"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-4 text-teal-600">Filter by Rent</h3>
        <div className="space-y-3">
          {rentOptions.map((option) => (
            <label key={option} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={option}
                checked={selectedRent === option}
                onChange={() => handleRentChange(option)}
                className="text-teal-600 focus:ring-teal-500"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* PG Cards */}
      <div className="flex-1">
        <div className="text-center mt-6">
          <p className="text-gray-600 font-extrabold font-sans text-3xl">
            To find PG near you, provide the city
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 bg-white p-3 rounded-xl w-fit mx-auto mt-8 shadow-md hover:shadow-lg transition-all duration-300 border border-teal-500"
        >
          <input
            type="text"
            className="bg-transparent border border-teal-300 text-black px-4 py-2 rounded-md w-72 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-gray-500 transition-all duration-200"
            placeholder="Enter city to find PGs"
            value={city}
            onChange={handleChange}
          />
          <button
            type="submit"
            className="bg-teal-600 text-white p-2 rounded-md hover:bg-teal-700 transition-colors duration-200"
            aria-label="Search"
          >
            <IoSearchCircle className="text-3xl" />
          </button>
        </form>

        <div className="mt-10 grid cb:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {availablePgList.length > 0 ? (
            availablePgList.map((pg) => (
              <div
                key={pg._id}
                className="bg-white shadow-md rounded-xl overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
              >
                <Swiper
                  modules={[Navigation, Autoplay]}
                  navigation
                  autoplay={{ delay: 2500, disableOnInteraction: false }}
                  slidesPerView={1}
                  spaceBetween={10}
                  className="w-full h-52"
                >
                  {pg.images.map((img, index) => (
                    <SwiperSlide key={index}>
                      <img
                        src={img}
                        alt={`${pg.name}-${index}`}
                        className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>

                <div className="p-4">
                  <h2 className="text-xl font-bold mb-1 hover:text-teal-600 transition-colors duration-200">
                    {pg.name}
                  </h2>
                  <p className="text-sm text-gray-500 mb-2">
                    {pg.address.city}, {pg.address.state}
                  </p>
                  <p className="text-lg text-green-600 font-semibold mb-2">
                    ₹{pg.rent} / month
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    Gender Allowed: <span className="font-medium">{pg.genderAllowed}</span>
                  </p>
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Amenities:</strong> {pg.amenities.join(', ')}
                  </p>

                  <button
                    id={`book-btn-${pg._id}`}
                    className={`mt-2 px-4 py-2 rounded-md w-full text-center font-medium ${
                      bookingStatus[pg._id]
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    } transition-colors duration-200`}
                    onClick={() => handleBooking(pg)}
                    data-tooltip-id={`book-btn-${pg._id}`}
                    data-tooltip-content={
                      bookingStatus[pg._id]?.status === 'rejected'
                        ? `Rejection Reason: ${bookingStatus[pg._id]?.rejectionReason || 'No reason provided'}`
                        : bookingStatus[pg._id]
                        ? 'Booking already in progress or completed'
                        : 'Click to book this PG'
                    }
                  >
                    {bookingStatus[pg._id] ? bookingStatus[pg._id]?.status : 'Book Now'}
                  </button>

                  <ReactTooltip
                    id={`book-btn-${pg._id}`}
                    place="top"
                    className="bg-gray-800 text-white"
                    delayHide={500}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No available PGs found for the selected filters.</p>
          )}
        </div>
      </div>
      <ToastContainer />
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pgDetails={modalPgDetails}
        bookingStatus={modalBookingStatus}
        hasCompletedPayment={hasCompletedPayment}
        
      />
    </div>
  );
}

export default FetchPgDetails;