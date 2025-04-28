import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { motion } from 'framer-motion'

const MyProfile = () => {
  const [isEdit, setIsEdit] = useState(false)
  const [dob, setDob] = useState('')
  const [address, setAddress] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [loading, setLoading] = useState(true)

  const {
    token,
    backendUrl,
    userData,
    setUserData,
    loadUserProfileData
  } = useContext(AppContext)

  useEffect(() => {
    const fetchData = async () => {
      if (!userData) {
        console.log('No userData found, loading profile...')
        await loadUserProfileData();
      }
      setLoading(false)
    }
    fetchData();
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
      console.error('Error updating profile:', error)
      toast.error(error.message)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletePassword) {
      return toast.error('Please enter your password')
    }
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
      console.error('Error deleting profile:', error)
      toast.error('Something went wrong while deleting profile')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500 text-lg">Loading profile...</p>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500 text-lg">Failed to load profile.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10 text-gray-700"
    >
      <div className="flex flex-col items-center">
        <img className="w-28 h-28 rounded-full border-4 border-primary shadow-sm" src={assets.profile_pic} alt="Profile" />
        <h2 className="text-2xl font-semibold text-gray-800 mt-4">{userData.firstName} {userData.lastName}</h2>
        <p className="text-sm text-gray-500 mt-1">MindMatters User</p>
      </div>

      <div className="mt-8">
        <h3 className="text-primary font-bold mb-2 border-b pb-1">Contact Information</h3>
        <div className="space-y-3 mt-3">
          <div className="flex gap-2">
            <span className="font-medium w-24">Email:</span>
            <span className="text-blue-600">{userData.email}</span>
          </div>
          <div className="flex gap-2 items-center">
            <span className="font-medium w-24">Phone:</span>
            {isEdit ? (
              <input
                type="text"
                className="border rounded p-1 flex-1"
                value={userData.phone}
                onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
              />
            ) : (
              <span>{userData.phone}</span>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <span className="font-medium w-24">Address:</span>
            {isEdit ? (
              <input
                type="text"
                className="border rounded p-1 flex-1"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            ) : (
              <span>{userData.address || '-'}</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-primary font-bold mb-2 border-b pb-1">Basic Information</h3>
        <div className="space-y-3 mt-3">
          <div className="flex gap-2">
            <span className="font-medium w-24">Gender:</span>
            <span>{userData.gender}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-medium w-24">Birthday:</span>
            <span>{dob}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-8">
        {isEdit ? (
          <button
            onClick={updateUserProfileData}
            className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => setIsEdit(true)}
            className="px-6 py-2 border border-primary text-primary rounded-full hover:bg-primary hover:text-white transition"
          >
            Edit Profile
          </button>
        )}
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-6 py-2 border border-red-500 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition"
        >
          Delete Account
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-lg">
            <h2 className="text-lg font-bold mb-3 text-gray-800">Confirm Deletion</h2>
            <p className="text-sm text-gray-500 mb-4">Please enter your password to continue:</p>
            <input
              type="password"
              placeholder="Password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="border w-full p-2 rounded mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default MyProfile