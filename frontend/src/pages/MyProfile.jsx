import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const MyProfile = () => {
  const [isEdit, setIsEdit] = useState(false)
  const [dob, setDob] = useState('')
  const [address, setAddress] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')

  const {
    token,
    backendUrl,
    userData,
    setUserData,
    loadUserProfileData
  } = useContext(AppContext)

  useEffect(() => {
    if (!userData) {
      loadUserProfileData()
    }
  }, [])

  useEffect(() => {
    if (userData) {
      setDob(userData.dob || '2000-01-01')
      setAddress(userData.address || '')
    }
  }, [userData])

  const updateUserProfileData = async () => {
    try {
      const formData = new FormData()
      formData.append('phone', userData.phone)
      formData.append('address', address)

      const { data } = await axios.post(
        `${backendUrl}/api/student/update-profile`,
        formData,
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        await loadUserProfileData()
        setIsEdit(false)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletePassword) return toast.error('Please enter your password')

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/student/delete-profile`,
        { password: deletePassword },
        { headers: { token } }
      )

      if (data.success) {
        toast.success('Profile deleted successfully')
        localStorage.removeItem('token')
        setUserData(null)
        window.location.href = '/login'
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong while deleting profile')
    }
  }

  return userData ? (
    <div className='max-w-lg flex flex-col gap-2 text-sm pt-5'>
      <img className='w-36 rounded' src={assets.profile_pic} alt="profile" />

      <p className='font-medium text-3xl text-[#262626] mt-4'>
        {userData.firstName} {userData.lastName}
      </p>

      <hr className='bg-[#ADADAD] h-[1px] border-none' />

      <div>
        <p className='text-gray-600 underline mt-3'>CONTACT INFORMATION</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-[#363636]'>
          <p className='font-medium'>Email id:</p>
          <p className='text-blue-500'>{userData.email}</p>

          <p className='font-medium'>Phone:</p>
          {isEdit ? (
            <input
              className='bg-gray-50 max-w-52'
              type="text"
              onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
              value={userData.phone}
            />
          ) : (
            <p className='text-blue-500'>{userData.phone}</p>
          )}

          <p className='font-medium'>Address:</p>
          {isEdit ? (
            <input
              className='bg-gray-50'
              type="text"
              onChange={(e) => setAddress(e.target.value)}
              value={address}
              placeholder="e.g. 123, Street Name, City"
            />
          ) : (
            <p className='text-gray-500'>{userData.address}</p>
          )}
        </div>
      </div>

      <div>
        <p className='text-[#797979] underline mt-3'>BASIC INFORMATION</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-gray-600'>
          <p className='font-medium'>Gender:</p>
          <p className='text-gray-500'>{userData.gender}</p>

          <p className='font-medium'>Birthday:</p>
          <p className='text-gray-500'>{dob}</p>
        </div>
      </div>

      <div className='mt-10 flex gap-4'>
        {isEdit ? (
          <button
            onClick={updateUserProfileData}
            className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'
          >
            Save information
          </button>
        ) : (
          <button
            onClick={() => setIsEdit(true)}
            className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'
          >
            Edit
          </button>
        )}

        <button
          onClick={() => setShowDeleteModal(true)}
          className='border border-red-500 text-red-500 px-8 py-2 rounded-full hover:bg-red-500 hover:text-white transition-all'
        >
          Delete Profile
        </button>
      </div>


      {showDeleteModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md'>
            <h2 className='text-lg font-semibold mb-4'>Confirm Profile Deletion</h2>
            <p className='text-sm mb-4 text-gray-700'>Please enter your password to confirm:</p>
            <input
              type='password'
              placeholder='Enter password'
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className='border border-gray-300 rounded w-full p-2 mb-4'
            />
            <div className='flex justify-end gap-4'>
              <button
                onClick={() => setShowDeleteModal(false)}
                className='px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300'
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className='px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600'
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : null
}

export default MyProfile
