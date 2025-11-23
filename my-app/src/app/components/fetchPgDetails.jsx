// 'use client';

// import { useState, useEffect } from 'react';
// import { IoSearchCircle } from 'react-icons/io5';
// import { useSession } from 'next-auth/react';
// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Navigation, Autoplay } from 'swiper/modules';
// import { Tooltip as ReactTooltip } from 'react-tooltip';
// import dynamic from 'next/dynamic';
// import { useRouter } from 'next/navigation';
// import { ToastContainer, toast } from 'react-toastify';
// import 'swiper/css';
// import 'swiper/css/navigation';
// import 'swiper/css/autoplay';
// import 'react-tooltip/dist/react-tooltip.css';
// import 'react-toastify/dist/ReactToastify.css';

// const BookingModal = dynamic(() => import('./bookingModal'), {
//   ssr: false,
// });

// function FetchPgDetails() {
//   const { data: session } = useSession();
//   const router = useRouter();
//   const [city, setCity] = useState('');
//   const [selectedSharing, setSelectedSharing] = useState('');
//   const [selectedGender, setSelectedGender] = useState('');
//   const [selectedRent, setSelectedRent] = useState('');
//   const [pgList, setPgList] = useState([]);
//   const [bookingStatus, setBookingStatus] = useState({});
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalPgDetails, setModalPgDetails] = useState(null);
//   const [modalBookingStatus, setModalBookingStatus] = useState(null);
//   const [hasCompletedPayment, setHasCompletedPayment] = useState(false);

//   const handleChange = (e) => setCity(e.target.value);
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     fetchData();
//   };

//   const handleSharingChange = (value) => {
//     setSelectedSharing((prev) => (prev === value ? '' : value));
//   };
//   const handleGenderChange = (value) => {
//     setSelectedGender((prev) => (prev === value ? '' : value));
//   };
//   const handleRentChange = (value) => {
//     setSelectedRent((prev) => (prev === value ? '' : value));
//   };

//   const fetchData = async () => {
//     const formattedCity =
//       city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
//     const requestBody = { city: formattedCity };

//     if (selectedSharing) requestBody.sharing = selectedSharing;
//     if (selectedGender) requestBody.gender = selectedGender;
//     if (selectedRent) requestBody.rent = selectedRent;
//     requestBody.availability = true;

//     try {
//       const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/proxy/pg`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(requestBody),
//       });

//       const data = await res.json();
//       setPgList(data.data || []);
//     } catch (err) {
//       console.log('Error fetching details', err);
//       toast.error('Failed to fetch PG details. Please try again.');
//     }
//   };

//   const fetchBookingStatus = async (pgId) => {
//     try {
//       const user = session?.user?.id;
//       if (!user) return;

//       const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/proxy/booking-status/${user}/${pgId}`);
//       const data = await res.json();

//       if (res.ok && data.status) {
//         setBookingStatus((prevStatus) => ({
//           ...prevStatus,
//           [pgId]: {
//             bookingId: data.bookingId,
//             status: data.status,
//             rejectionReason: data.rejectionReason,
//           },
//         }));
//       } else {
//         setBookingStatus((prevStatus) => ({
//           ...prevStatus,
//           [pgId]: null,
//         }));
//       }
//     } catch (err) {
//       console.error('Error fetching booking status:', err);
//     }
//   };

//   const checkCompletedPayment = async () => {
//     try {
//       const user = session?.user?.id;
//       if (!user) return;

//       const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/proxy/api/payment/has-completed-payment/${user}`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         credentials: 'include',
//       });

//       const data = await res.json();
//       setHasCompletedPayment(data.hasCompletedPayment || false);
//     } catch (err) {
//       console.error('Error checking completed payment:', err);
//       toast.error('Failed to check payment status. Please try again.');
//     }
//   };

//   const handleBooking = async (pg) => {
//     if (!session || session.user.role !== 'user') {
//       toast.warning('To book the PG, sign up as a user first.');
//       setTimeout(() => {
//         router.push('/signup');
//       }, 2000);
//       return;
//     }

//     const currentStatus = bookingStatus[pg._id];

//     if (currentStatus) {
//       setModalPgDetails(pg);
//       setModalBookingStatus(currentStatus);
//       setIsModalOpen(true);
//       return;
//     }

//     try {
//       const res = await fetch('/api/proxy/booking', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         credentials: 'include',
//         body: JSON.stringify({ pg }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         const newStatus = { status: 'pending', bookingId: data.bookingId };
//         setBookingStatus((prevStatus) => ({
//           ...prevStatus,
//           [pg._id]: newStatus,
//         }));
//         setModalPgDetails(pg);
//         setModalBookingStatus(newStatus);
//         setIsModalOpen(true);
//         fetchBookingStatus(pg._id);
//       } else {
//         const errorStatus = {
//           status: 'rejected',
//           rejectionReason: data.rejectionReason || 'Booking failed.',
//         };
//         setBookingStatus((prevStatus) => ({
//           ...prevStatus,
//           [pg._id]: errorStatus,
//         }));
//         setModalPgDetails(pg);
//         setModalBookingStatus(errorStatus);
//         setIsModalOpen(true);
//       }
//     } catch (err) {
//       console.error('Error booking PG:', err);
//       const errorStatus = {
//         status: 'rejected',
//         rejectionReason: 'Booking failed due to an error.',
//       };
//       setBookingStatus((prevStatus) => ({
//         ...prevStatus,
//         [pg._id]: errorStatus,
//       }));
//       setModalPgDetails(pg);
//       setModalBookingStatus(errorStatus);
//       setIsModalOpen(true);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [selectedSharing, selectedGender, selectedRent]);

//   useEffect(() => {
//     if (session?.user?.id) {
//       pgList.forEach((pg) => {
//         fetchBookingStatus(pg._id);
//       });
//       checkCompletedPayment();
//     }
//   }, [pgList, session]);

//   const sharingOptions = ['Single', 'Double', 'Triple', 'Quad', 'Bunk Bed'];
//   const genderOptions = ['Boys', 'Girls'];
//   const rentOptions = [
//     '<5000',
//     '5000-10000',
//     '10000-15000',
//     '15000-20000',
//     '20000+',
//   ];

//   const availablePgList = pgList.filter((pg) => pg.availability === true);

//   return (
//     <div className="flex flex-col md:flex-row gap-6 p-6 pt-20 bg-[var(--color-background)] min-h-screen transition-colors duration-500">
//       {/* Filter Panel */}
//       <div className="md:w-1/4 w-full bg-white p-4 rounded-xl shadow-md border border-teal-300 h-fit">
//         <h3 className="text-lg font-semibold mb-4 text-teal-600">Filter by Sharing</h3>
//         <div className="space-y-3">
//           {sharingOptions.map((option) => (
//             <label key={option} className="flex items-center gap-2 cursor-pointer">
//               <input
//                 type="checkbox"
//                 value={option}
//                 checked={selectedSharing === option}
//                 onChange={() => handleSharingChange(option)}
//                 className="text-teal-600 focus:ring-teal-500"
//               />
//               <span className="text-gray-700">{option}</span>
//             </label>
//           ))}
//         </div>

//         <h3 className="text-lg font-semibold mt-6 mb-4 text-teal-600">Filter by Gender</h3>
//         <div className="space-y-3">
//           {genderOptions.map((option) => (
//             <label key={option} className="flex items-center gap-2 cursor-pointer">
//               <input
//                 type="checkbox"
//                 value={option}
//                 checked={selectedGender === option}
//                 onChange={() => handleGenderChange(option)}
//                 className="text-teal-600 focus:ring-teal-500"
//               />
//               <span className="text-gray-700">{option}</span>
//             </label>
//           ))}
//         </div>

//         <h3 className="text-lg font-semibold mt-6 mb-4 text-teal-600">Filter by Rent</h3>
//         <div className="space-y-3">
//           {rentOptions.map((option) => (
//             <label key={option} className="flex items-center gap-2 cursor-pointer">
//               <input
//                 type="checkbox"
//                 value={option}
//                 checked={selectedRent === option}
//                 onChange={() => handleRentChange(option)}
//                 className="text-teal-600 focus:ring-teal-500"
//               />
//               <span className="text-gray-700">{option}</span>
//             </label>
//           ))}
//         </div>
//       </div>

//       {/* PG Cards */}
//       <div className="flex-1">
//         <div className="text-center mt-6">
//           <p className="text-gray-600 font-extrabold font-sans text-3xl">
//             To find PG near you, provide the city
//           </p>
//         </div>
//         <form
//           onSubmit={handleSubmit}
//           className="flex items-center gap-3 bg-white p-3 rounded-xl w-fit mx-auto mt-8 shadow-md hover:shadow-lg transition-all duration-300 border border-teal-500"
//         >
//           <input
//             type="text"
//             className="bg-transparent border border-teal-300 text-black px-4 py-2 rounded-md w-72 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-gray-500 transition-all duration-200"
//             placeholder="Enter city to find PGs"
//             value={city}
//             onChange={handleChange}
//           />
//           <button
//             type="submit"
//             className="bg-teal-600 text-white p-2 rounded-md hover:bg-teal-700 transition-colors duration-200"
//             aria-label="Search"
//           >
//             <IoSearchCircle className="text-3xl" />
//           </button>
//         </form>

//         <div className="mt-10 grid cb:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
//           {availablePgList.length > 0 ? (
//             availablePgList.map((pg) => (
//               <div
//                 key={pg._id}
//                 className="bg-white shadow-md rounded-xl overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
//               >
//                 <Swiper
//                   modules={[Navigation, Autoplay]}
//                   navigation
//                   autoplay={{ delay: 2500, disableOnInteraction: false }}
//                   slidesPerView={1}
//                   spaceBetween={10}
//                   className="w-full h-52"
//                 >
//                   {pg.images.map((img, index) => (
//                     <SwiperSlide key={index}>
//                       <img
//                         src={img}
//                         alt={`${pg.name}-${index}`}
//                         className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
//                       />
//                     </SwiperSlide>
//                   ))}
//                 </Swiper>

//                 <div className="p-4">
//                   <h2 className="text-xl font-bold mb-1 hover:text-teal-600 transition-colors duration-200">
//                     {pg.name}
//                   </h2>
//                   <p className="text-sm text-gray-500 mb-2">
//                     {pg.address.city}, {pg.address.state}
//                   </p>
//                   <p className="text-lg text-green-600 font-semibold mb-2">
//                     ₹{pg.rent} / month
//                   </p>
//                   <p className="text-sm text-gray-700 mb-2">
//                     Gender Allowed: <span className="font-medium">{pg.genderAllowed}</span>
//                   </p>
//                   <p className="text-sm text-gray-700 mb-3">
//                     <strong>Amenities:</strong> {pg.amenities.join(', ')}
//                   </p>

//                   <button
//                     id={`book-btn-${pg._id}`}
//                     className={`mt-2 px-4 py-2 rounded-md w-full text-center font-medium ${
//                       bookingStatus[pg._id]
//                         ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
//                         : 'bg-teal-600 text-white hover:bg-teal-700'
//                     } transition-colors duration-200`}
//                     onClick={() => handleBooking(pg)}
//                     data-tooltip-id={`book-btn-${pg._id}`}
//                     data-tooltip-content={
//                       bookingStatus[pg._id]?.status === 'rejected'
//                         ? `Rejection Reason: ${bookingStatus[pg._id]?.rejectionReason || 'No reason provided'}`
//                         : bookingStatus[pg._id]
//                         ? 'Booking already in progress or completed'
//                         : 'Click to book this PG'
//                     }
//                   >
//                     {bookingStatus[pg._id] ? bookingStatus[pg._id]?.status : 'Book Now'}
//                   </button>

//                   <ReactTooltip
//                     id={`book-btn-${pg._id}`}
//                     place="top"
//                     className="bg-gray-800 text-white"
//                     delayHide={500}
//                   />
//                 </div>
//               </div>
//             ))
//           ) : (
//             <p className="text-center text-gray-500">No available PGs found for the selected filters.</p>
//           )}
//         </div>
//       </div>
//       <ToastContainer />
//       <BookingModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         pgDetails={modalPgDetails}
//         bookingStatus={modalBookingStatus}
//         hasCompletedPayment={hasCompletedPayment}

//       />
//     </div>
//   );
// }

// export default FetchPgDetails;
// 'use client';

// import { useState, useEffect } from 'react';
// import { IoSearchCircle } from 'react-icons/io5';
// import { useSession } from 'next-auth/react';
// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Navigation, Autoplay } from 'swiper/modules';
// import { Tooltip as ReactTooltip } from 'react-tooltip';
// import dynamic from 'next/dynamic';
// import { useRouter } from 'next/navigation';
// import { ToastContainer, toast } from 'react-toastify';
// import 'swiper/css';
// import 'swiper/css/navigation';
// import 'swiper/css/autoplay';
// import 'react-tooltip/dist/react-tooltip.css';
// import 'react-toastify/dist/ReactToastify.css';

// const BookingModal = dynamic(() => import('./bookingModal'), {
//   ssr: false,
// });

// function FetchPgDetails() {
//   const { data: session } = useSession();
//   const router = useRouter();

//   const [city, setCity] = useState('');
//   const [selectedSharing, setSelectedSharing] = useState('');
//   const [selectedGender, setSelectedGender] = useState('');
//   const [selectedRent, setSelectedRent] = useState('');

//   const [pgList, setPgList] = useState([]);
//   const [bookingStatus, setBookingStatus] = useState({});
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalPgDetails, setModalPgDetails] = useState(null);
//   const [modalBookingStatus, setModalBookingStatus] = useState(null);
//   const [hasCompletedPayment, setHasCompletedPayment] = useState(false);

//   // ⭐ NEW: Mobile filter toggle state
//   const [showFilter, setShowFilter] = useState(false);

//   const handleChange = (e) => setCity(e.target.value);
//  const handleSubmit = (e) => {
//   e.preventDefault();
//   fetchData();
// };

//   const handleSharingChange = (value) => {
//     setSelectedSharing((prev) => (prev === value ? '' : value));
//   };
//   const handleGenderChange = (value) => {
//     setSelectedGender((prev) => (prev === value ? '' : value));
//   };
//   const handleRentChange = (value) => {
//     setSelectedRent((prev) => (prev === value ? '' : value));
//   };

//   const fetchData = async () => {
//     const formattedCity =
//       city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
//     const requestBody = { city: formattedCity };

//     if (selectedSharing) requestBody.sharing = selectedSharing;
//     if (selectedGender) requestBody.gender = selectedGender;
//     if (selectedRent) requestBody.rent = selectedRent;
//     requestBody.availability = true;

//     try {
//       const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/proxy/pg`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(requestBody),
//       });

//       const data = await res.json();
//       setPgList(data.data || []);
//     } catch (err) {
//       console.log('Error fetching details', err);
//       toast.error('Failed to fetch PG details. Please try again.');
//     }
//   };

//   // ⭐ NEW: Fetch all PGs when page loads
// const fetchAllPGs = async () => {
//   try {
//     const params = new URLSearchParams();

//     if (selectedSharing) params.append("sharing", selectedSharing);
//     if (selectedGender) params.append("gender", selectedGender);
//     if (selectedRent) params.append("rent", selectedRent);

//     const res = await fetch(
//       `/pg-all?${params.toString()}`
//     );

//     const data = await res.json();
//     setPgList(data.data || []);
//   } catch (err) {
//     console.log("Error fetching all PGs", err);
//     toast.error("Failed to load PGs.");
//   }
// };

//   const fetchBookingStatus = async (pgId) => {
//     try {
//       const user = session?.user?.id;
//       if (!user) return;

//       const res = await fetch(
//         `/booking-status/${user}/${pgId}`
//       );
//       const data = await res.json();

//       if (res.ok && data.status) {
//         setBookingStatus((prevStatus) => ({
//           ...prevStatus,
//           [pgId]: {
//             bookingId: data.bookingId,
//             status: data.status,
//             rejectionReason: data.rejectionReason,
//           },
//         }));
//       } else {
//         setBookingStatus((prevStatus) => ({
//           ...prevStatus,
//           [pgId]: null,
//         }));
//       }
//     } catch (err) {
//       console.error('Error fetching booking status:', err);
//     }
//   };

//   const checkCompletedPayment = async () => {
//     try {
//       const user = session?.user?.id;
//       if (!user) return;

//       const res = await fetch(
//         `/api/payment/has-completed-payment/${user}`,
//         {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           credentials: 'include',
//         }
//       );

//       const data = await res.json();
//       setHasCompletedPayment(data.hasCompletedPayment || false);
//     } catch (err) {
//       console.error('Error checking completed payment:', err);
//       toast.error('Failed to check payment status. Please try again.');
//     }
//   };

//   const handleBooking = async (pg) => {
//     if (!session || session.user.role !== 'user') {
//       toast.warning('To book the PG, sign up as a user first.');
//       setTimeout(() => {
//         router.push('/signup');
//       }, 2000);
//       return;
//     }

//     const currentStatus = bookingStatus[pg._id];

//     if (currentStatus) {
//       setModalPgDetails(pg);
//       setModalBookingStatus(currentStatus);
//       setIsModalOpen(true);
//       return;
//     }

//     try {
//       const res = await fetch(
//         '/booking',
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           credentials: 'include',
//           body: JSON.stringify({ pg }),
//         }
//       );

//       const data = await res.json();

//       if (res.ok) {
//         const newStatus = { status: 'pending', bookingId: data.bookingId };
//         setBookingStatus((prevStatus) => ({
//           ...prevStatus,
//           [pg._id]: newStatus,
//         }));
//         setModalPgDetails(pg);
//         setModalBookingStatus(newStatus);
//         setIsModalOpen(true);
//         fetchBookingStatus(pg._id);
//       } else {
//         const errorStatus = {
//           status: 'rejected',
//           rejectionReason:
//             data.rejectionReason || 'Booking failed.',
//         };
//         setBookingStatus((prevStatus) => ({
//           ...prevStatus,
//           [pg._id]: errorStatus,
//         }));
//         setModalPgDetails(pg);
//         setModalBookingStatus(errorStatus);
//         setIsModalOpen(true);
//       }
//     } catch (err) {
//       console.error('Error booking PG:', err);
//       const errorStatus = {
//         status: 'rejected',
//         rejectionReason: 'Booking failed due to an error.',
//       };
//       setBookingStatus((prevStatus) => ({
//         ...prevStatus,
//         [pg._id]: errorStatus,
//       }));
//       setModalPgDetails(pg);
//       setModalBookingStatus(errorStatus);
//       setIsModalOpen(true);
//     }
//   };

// useEffect(() => {
//   if (city.trim() !== "") {
//     fetchData();     // when city search active → search by city
//   } else {
//     fetchAllPGs();   // when no search → filter all PGs
//   }
// }, [selectedSharing, selectedGender, selectedRent]);

//   useEffect(() => {
//     if (session?.user?.id) {
//       pgList.forEach((pg) => {
//         fetchBookingStatus(pg._id);
//       });
//       checkCompletedPayment();
//     }
//   }, [pgList, session]);

//   const sharingOptions = ['Single', 'Double', 'Triple', 'Quad', 'Bunk Bed'];
//   const genderOptions = ['Boys', 'Girls'];
//   const rentOptions = [
//     '<5000',
//     '5000-10000',
//     '10000-15000',
//     '15000-20000',
//     '20000+',
//   ];

//   const availablePgList = pgList.filter((pg) => pg.availability === true);

//   return (
//     <div className="flex flex-col md:flex-row gap-6 p-6 pt-20 bg-[var(--color-background)] min-h-screen transition-colors duration-500">

//       {/* ⭐ MOBILE FILTER BUTTON */}
//       <button
//         className="md:hidden bg-teal-600 text-white px-4 py-2 rounded-md mb-4"
//         onClick={() => setShowFilter(!showFilter)}
//       >
//         {showFilter ? 'Hide Filters' : 'Show Filters'}
//       </button>

//       {/* ⭐ FILTER PANEL */}
//       <div
//         className={`md:w-1/4 w-full bg-white p-4 rounded-xl shadow-md border border-teal-300 h-fit
//         ${showFilter ? 'block' : 'hidden'} md:block`}
//       >
//         <h3 className="text-lg font-semibold mb-4 text-teal-600">Filter by Sharing</h3>
//         <div className="space-y-3">
//           {sharingOptions.map((option) => (
//             <label key={option} className="flex items-center gap-2 cursor-pointer">
//               <input
//                 type="checkbox"
//                 value={option}
//                 checked={selectedSharing === option}
//                 onChange={() => handleSharingChange(option)}
//                 className="text-teal-600 focus:ring-teal-500"
//               />
//               <span className="text-gray-700">{option}</span>
//             </label>
//           ))}
//         </div>

//         <h3 className="text-lg font-semibold mt-6 mb-4 text-teal-600">Filter by Gender</h3>
//         <div className="space-y-3">
//           {genderOptions.map((option) => (
//             <label key={option} className="flex items-center gap-2 cursor-pointer">
//               <input
//                 type="checkbox"
//                 value={option}
//                 checked={selectedGender === option}
//                 onChange={() => handleGenderChange(option)}
//                 className="text-teal-600 focus:ring-teal-500"
//               />
//               <span className="text-gray-700">{option}</span>
//             </label>
//           ))}
//         </div>

//         <h3 className="text-lg font-semibold mt-6 mb-4 text-teal-600">Filter by Rent</h3>
//         <div className="space-y-3">
//           {rentOptions.map((option) => (
//             <label key={option} className="flex items-center gap-2 cursor-pointer">
//               <input
//                 type="checkbox"
//                 value={option}
//                 checked={selectedRent === option}
//                 onChange={() => handleRentChange(option)}
//                 className="text-teal-600 focus:ring-teal-500"
//               />
//               <span className="text-gray-700">{option}</span>
//             </label>
//           ))}
//         </div>
//       </div>

//       {/* PG CARDS */}
//       <div className="flex-1">
//         <div className="text-center mt-6">
//           <p className="text-gray-600 font-extrabold font-sans text-3xl">
//             To find PG near you, provide the city
//           </p>
//         </div>

//         <form
//           onSubmit={handleSubmit}
//           className="flex items-center gap-3 bg-white p-3 rounded-xl w-fit mx-auto mt-8 shadow-md hover:shadow-lg transition-all duration-300 border border-teal-500"
//         >
//           <input
//             type="text"
//             className="bg-transparent border border-teal-300 text-black px-4 py-2 rounded-md w-72 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-gray-500 transition-all duration-200"
//             placeholder="Enter city to find PGs"
//             value={city}
//             onChange={handleChange}
//           />
//           <button
//             type="submit"
//             className="bg-teal-600 text-white p-2 rounded-md hover:bg-teal-700 transition-colors duration-200"
//             aria-label="Search"
//           >
//             <IoSearchCircle className="text-3xl" />
//           </button>
//         </form>

//         <div className="mt-10 grid cb:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
//           {availablePgList.length > 0 ? (
//             availablePgList.map((pg) => (
//               <div
//                 key={pg._id}
//                 className="bg-white shadow-md rounded-xl overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
//               >
//                 <Swiper
//                   modules={[Navigation, Autoplay]}
//                   navigation
//                   autoplay={{ delay: 2500, disableOnInteraction: false }}
//                   slidesPerView={1}
//                   spaceBetween={10}
//                   className="w-full h-52"
//                 >
//                   {pg.images.map((img, index) => (
//                     <SwiperSlide key={index}>
//                       <img
//                         src={img}
//                         alt={`${pg.name}-${index}`}
//                         className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
//                       />
//                     </SwiperSlide>
//                   ))}
//                 </Swiper>

//                 <div className="p-4">
//                   <h2 className="text-xl font-bold mb-1 hover:text-teal-600 transition-colors duration-200">
//                     {pg.name}
//                   </h2>
//                   <p className="text-sm text-gray-500 mb-2">
//                     {pg.address.city}, {pg.address.state}
//                   </p>
//                   <p className="text-lg text-green-600 font-semibold mb-2">
//                     ₹{pg.rent} / month
//                   </p>
//                   <p className="text-sm text-gray-700 mb-2">
//                     Gender Allowed:{' '}
//                     <span className="font-medium">{pg.genderAllowed}</span>
//                   </p>
//                   <p className="text-sm text-gray-700 mb-3">
//                     <strong>Amenities:</strong> {pg.amenities.join(', ')}
//                   </p>

//                   <button
//                     id={`book-btn-${pg._id}`}
//                     className={`mt-2 px-4 py-2 rounded-md w-full text-center font-medium ${
//                       bookingStatus[pg._id]
//                         ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
//                         : 'bg-teal-600 text-white hover:bg-teal-700'
//                     } transition-colors duration-200`}
//                     onClick={() => handleBooking(pg)}
//                     data-tooltip-id={`book-btn-${pg._id}`}
//                     data-tooltip-content={
//                       bookingStatus[pg._id]?.status === 'rejected'
//                         ? `Rejection Reason: ${
//                             bookingStatus[pg._id]?.rejectionReason ||
//                             'No reason provided'
//                           }`
//                         : bookingStatus[pg._id]
//                         ? 'Booking already in progress or completed'
//                         : 'Click to book this PG'
//                     }
//                   >
//                     {bookingStatus[pg._id]
//                       ? bookingStatus[pg._id]?.status
//                       : 'Book Now'}
//                   </button>

//                   <ReactTooltip
//                     id={`book-btn-${pg._id}`}
//                     place="top"
//                     className="bg-gray-800 text-white"
//                     delayHide={500}
//                   />
//                 </div>
//               </div>
//             ))
//           ) : (
//             <p className="text-center text-gray-500">
//               No available PGs found for the selected filters.
//             </p>
//           )}
//         </div>
//       </div>

//       <ToastContainer />
//       <BookingModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         pgDetails={modalPgDetails}
//         bookingStatus={modalBookingStatus}
//         hasCompletedPayment={hasCompletedPayment}
//       />
//     </div>
//   );
// }

// export default FetchPgDetails;

// app/pg/page.js  OR  components/FetchPgDetails.jsx
// app/pg/page.js  (or your page file)
"use client";

import { useState, useEffect, useRef } from "react";
import { IoSearchCircle } from "react-icons/io5";
import { useSession } from "next-auth/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { Tooltip as ReactTooltip } from "react-tooltip";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import "react-tooltip/dist/react-tooltip.css";
import "react-toastify/dist/ReactToastify.css";

const BookingModal = dynamic(() => import("./bookingModal"), { ssr: false });

export default function FetchPgDetails() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read filters from URL on load
  const urlCity = searchParams.get("city") || "";
  const urlSharing = searchParams.get("sharing") || "";
  const urlGender = searchParams.get("gender") || "";
  const urlRent = searchParams.get("rent") || "";

  // Local state (synced with URL)
  const [city, setCity] = useState(urlCity);
  const [sharing, setSharing] = useState(urlSharing);
  const [gender, setGender] = useState(urlGender);
  const [rent, setRent] = useState(urlRent);
  const [searchInput, setSearchInput] = useState(urlCity);

  // UI states
  const [pgList, setPgList] = useState([]);
  const [bookingStatus, setBookingStatus] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPgDetails, setModalPgDetails] = useState(null);
  const [modalBookingStatus, setModalBookingStatus] = useState(null);
  const [hasCompletedPayment, setHasCompletedPayment] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const loader = useRef(null); // For IntersectionObserver

  const sharingOptions = ["Single", "Double", "Triple", "Quad", "Bunk Bed"];
  const genderOptions = ["Boys", "Girls"];
  const rentOptions = [
    "<5000",
    "5000-10000",
    "10000-15000",
    "15000-20000",
    "20000+",
  ];

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loader.current) {
      observer.observe(loader.current);
    }

    return () => {
      if (loader.current) observer.unobserve(loader.current);
    };
  }, [hasMore, loading]);


  console.log("backend url",process.env.NEXT_PUBLIC_BACKEND_URL); // Should print: https://rent-spotter-new.onrender.com


  // Update URL whenever filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (sharing) params.set("sharing", sharing);
    if (gender) params.set("gender", gender);
    if (rent) params.set("rent", rent);

    // Remove empty params and update URL
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }, [city, sharing, gender, rent, pathname, router]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (!trimmed) return toast.warn("Please enter a city");
    setCity(trimmed);
  };

  // Fetch PGs by city
  const fetchByCity = async (cityName, pageNum = 1, reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        city: cityName,
        page: pageNum,
        limit: 9,
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/proxy/pg-all?${params.toString()}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${session.accessToken}`,  // ← this works
            "Content-Type": "application/json"
        },
        credentials: "include",
      });
      const result = await res.json();

      if (result.success) {
        setPgList((prev) => (reset ? result.data : [...prev, ...result.data]));
        setHasMore(result.hasMore);
      }
    } catch (err) {
      toast.error("Failed to load PGs");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all PGs with filters
  const fetchAllPGs = async (pageNum = 1, reset = false) => {
    if (loading && !reset) return;
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (city) params.append("city", city);
      if (sharing) params.append("sharing", sharing);
      if (gender) params.append("gender", gender);
      if (rent) params.append("rent", rent);
      params.append("page", pageNum);
      params.append("limit", 9);

      const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/proxy/pg-all?${params.toString()}`, {
        method: "GET",
        credentials: "include",
       headers: {
          "Authorization": `Bearer ${session.accessToken}`,  // ← this works
          "Content-Type": "application/json"
        },
      });
      const result = await res.json();

      if (result.success && Array.isArray(result.data)) {
        let newData = result.data;

        if (!reset) {
          // Remove duplicates based on _id
          const seenIds = new Set(pgList.map((p) => p._id));
          newData = result.data.filter((pg) => !seenIds.has(pg._id));
        }

        setPgList((prev) => (reset ? result.data : [...prev, ...newData]));
        setHasMore(result.hasMore !== false && newData.length > 0);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load more PGs");
    } finally {
      setLoading(false);
    }
  };

  // When filters change → reset list and refetch from page 1
  useEffect(() => {
    setPgList([]);
    setPage(1);
    setHasMore(true);

    if (city) {
      fetchByCity(city); // Your existing city-based POST fetch (keep or unify later)
    } else {
      fetchAllPGs(1, true);
    }
  }, [city, sharing, gender, rent]);

  // Load more when page increases
  useEffect(() => {
    if (page > 1) {
      if (city) {
        // If searching by city, you might want to unify both endpoints later
        // For now, skip auto-load if using city POST
      } else {
        fetchAllPGs(page);
      }
    }
  }, [page]);

  // Initial load
  useEffect(() => {
    if (!city && !sharing && !gender && !rent) {
      fetchAllPGs();
    }
  }, []);

  // Booking status & payment check
  const fetchBookingStatus = async (pgId) => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/proxy/booking-status/${session.user.id}/${pgId}`, {
        method: "GET",
       headers: {
          "Authorization": `Bearer ${session.accessToken}`,  // ← this works
          "Content-Type": "application/json"
        },
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.status) {
        setBookingStatus((prev) => ({
          ...prev,
          [pgId]: {
            status: data.status,
            bookingId: data.bookingId,
            rejectionReason: data.rejectionReason,
          },
        }));
      }
    } catch (err) {}
  };

  const checkCompletedPayment = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(
        `/api/payment/has-completed-payment/${session.user.id}`,
        {
          method: "GET",
         headers: {
          "Authorization": `Bearer ${session.accessToken}`,  // ← this works
          "Content-Type": "application/json"
        },
          credentials: "include",
        }
      );
      const data = await res.json();
      setHasCompletedPayment(data.hasCompletedPayment || false);
    } catch (err) {}
  };

  useEffect(() => {
    if (session?.user?.id && pgList.length > 0) {
      pgList.forEach((pg) => fetchBookingStatus(pg._id));
      checkCompletedPayment();
    }
  }, [pgList, session]);

  const handleBooking = async (pg) => {
    if (!session || session.user.role !== "user") {
      toast.warn("Please sign up as a user to book");
      setTimeout(() => router.push("/signup"), 2000);
      return;
    }

    const current = bookingStatus[pg._id];
    if (current) {
      setModalPgDetails(pg);
      setModalBookingStatus(current);
      setIsModalOpen(true);
      return;
    }

    try {
      const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/proxy/booking`, {
        method: "POST",
      headers: {
    "Authorization": `Bearer ${session.accessToken}`,  // ← this works
    "Content-Type": "application/json"
  },
        credentials: "include",
        body: JSON.stringify({ pg }),
      });
      const data = await res.json();

      if (res.ok) {
        const newStatus = { status: "pending", bookingId: data.bookingId };
        setBookingStatus((prev) => ({ ...prev, [pg._id]: newStatus }));
        setModalPgDetails(pg);
        setModalBookingStatus(newStatus);
        setIsModalOpen(true);
      } else {
        toast.error(data.message || "Booking failed");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const availablePgs = pgList.filter((pg) => pg.availability);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-teal-700 mb-4">
          Find Your Perfect PG
        </h1>
        <p className="text-gray-600 text-lg">
          Safe, affordable & comfortable stays
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10">
        <div className="flex gap-3 bg-white p-3 rounded-xl shadow-lg border border-teal-300">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by city (e.g. Mumbai, Delhi)"
            className="flex-1 px-5 py-3 bg-transparent outline-none text-gray-800 placeholder-gray-500"
          />
          <button
            type="submit"
            className="bg-teal-600 text-white p-3 rounded-lg hover:bg-teal-700 transition"
          >
            <IoSearchCircle className="text-3xl" />
          </button>
        </div>
      </form>

      {/* Mobile Filter Toggle */}
      <div className="md:hidden flex justify-between items-center mb-6 px-2">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg"
        >
          Filters {showFilter ? "Hide" : "Show"}
        </button>
        {(sharing || gender || rent || city) && (
          <button
            onClick={() => {
              setCity("");
              setSharing("");
              setGender("");
              setRent("");
              setSearchInput("");
              router.replace(pathname);
            }}
            className="text-teal-600 font-semibold underline"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filter Panel */}
        <div className={`${showFilter ? "block" : "hidden"} md:block`}>
          <div className="bg-white rounded-xl shadow-lg border border-teal-200 p-6 sticky top-24">
            <h2 className="text-2xl font-bold text-teal-700 mb-6">Filters</h2>

            <div className="mb-7">
              <h3 className="font-semibold text-teal-600 mb-4">Sharing</h3>
              <div className="space-y-3">
                {sharingOptions.map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={sharing === opt}
                      onChange={() => setSharing(sharing === opt ? "" : opt)}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-7">
              <h3 className="font-semibold text-teal-600 mb-4">Gender</h3>
              <div className="space-y-3">
                {genderOptions.map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={gender === opt}
                      onChange={() => setGender(gender === opt ? "" : opt)}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-7">
              <h3 className="font-semibold text-teal-600 mb-4">Rent Range</h3>
              <div className="space-y-3">
                {rentOptions.map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={rent === opt}
                      onChange={() => setRent(rent === opt ? "" : opt)}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="text-gray-700">₹{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PG Cards */}
        <div className="md:col-span-3">
          {/* Show PG Cards */}
          {availablePgs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {availablePgs.map((pg, index) => (
                <div
                  key={`${pg._id}-${index}`}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  {/* Your existing PG card code */}
                  <Swiper
                    modules={[Navigation, Autoplay]}
                    navigation
                    autoplay={{ delay: 3000 }}
                    className="h-56"
                  >
                    {pg.images.map((img, i) => (
                      <SwiperSlide key={i}>
                        <img
                          src={img}
                          alt={pg.name}
                          className="w-full h-full object-cover"
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-800">
                      {pg.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {pg.address.city}, {pg.address.state}
                    </p>
                    <p className="text-2xl font-bold text-green-600 my-2">
                      ₹{pg.rent}/month
                    </p>

                    <p className="text-sm text-gray-600">
                      Gender: {pg.genderAllowed}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      Amenities: {pg.amenities.join(", ")}
                    </p>

                    <button
                      onClick={() => handleBooking(pg)}
                      className={`mt-4 w-full py-3 rounded-lg font-semibold transition ${
                        bookingStatus[pg._id]
                          ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                          : "bg-teal-600 text-white hover:bg-teal-700"
                      }`}
                    >
                      {bookingStatus[pg._id]?.status || "Book Now"}
                    </button>
                  </div>
                </div>
              ))}

              {/* Invisible trigger for IntersectionObserver */}
              <div ref={loader} className="col-span-full h-10" />
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">
                {city || sharing || gender || rent
                  ? "No PGs found matching your filters."
                  : "Search or apply filters to see available PGs."}
              </p>
            </div>
          )}

          {/* Loading Spinner (appears below the grid when fetching more) */}
          {loading && hasMore && availablePgs.length > 0 && (
            <div className="flex justify-center items-center py-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-teal-700 font-medium text-lg">
                  Loading more PGs...
                </span>
              </div>
            </div>
          )}

          {/* End of results message */}
          {!hasMore && availablePgs.length > 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg font-medium">
                That's all! You've seen all available PGs.
              </p>
            </div>
          )}

          {/* Initial loading state (when page first loads and no data yet) */}
          {loading && availablePgs.length === 0 && (
            <div className="text-center py-32">
              <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-teal-700 text-lg">
                Finding the best PGs for you...
              </p>
            </div>
          )}
        </div>
      </div>

      <ToastContainer position="top-right" />
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



