import appointment_img from './appointment_img.png'
import header_img from './header_img.png'
import group_profiles from './group_profiles.png'
import profile_pic from './profile_pic.png'
import contact_image from './contact_image.png'
import about_image from './about_image.png'
import logo from './logo.svg'
import dropdown_icon from './dropdown_icon.svg'
import menu_icon from './menu_icon.svg'
import cross_icon from './cross_icon.png'
import chats_icon from './chats_icon.svg'
import verified_icon from './verified_icon.svg'
import arrow_icon from './arrow_icon.svg'
import info_icon from './info_icon.svg'
import upload_icon from './upload_icon.png'
import stripe_logo from './stripe_logo.png'
import razorpay_logo from './razorpay_logo.png'
import doc1 from './doc1.png'
import doc2 from './doc2.png'
import doc3 from './doc3.png'
import doc4 from './doc4.png'
import doc5 from './doc5.png'
import doc6 from './doc6.png'
import doc7 from './doc7.png'
import doc8 from './doc8.png'
import doc9 from './doc9.png'
import doc10 from './doc10.png'
import doc11 from './doc11.png'
import doc12 from './doc12.png'
import doc13 from './doc13.png'
import doc14 from './doc14.png'
import doc15 from './doc15.png'
import prod1 from './prod1.jpg'
import prod2 from './prod2.jpg'
import prod3 from './prod3.jpg'
import prod4 from './prod4.jpg'
import prod5 from './prod5.jpg'
import prod6 from './prod6.jpg'
import prod7 from './prod7.jpg'
import prod8 from './prod8.jpg'
import prod9 from './prod9.jpg'
import prod10 from './prod10.jpg'
import prod11 from './prod11.jpg'
import prod12 from './prod12.jpg'
import prod13 from './prod13.jpg'
import prod14 from './prod14.jpg'
import prod15 from './prod15.jpg'
import prod16 from './prod16.jpg'
import prod17 from './prod17.jpg'
import prod18 from './prod18.jpg'
import prod19 from './prod19.jpg'
import prod20 from './prod20.jpg'
import Dermatologist from './Dermatologist.svg'
import Gastroenterologist from './Gastroenterologist.svg'
import General_physician from './General_physician.svg'
import Gynecologist from './Gynecologist.svg'
import Neurologist from './Neurologist.svg'
import Pediatricians from './Pediatricians.svg'


export const assets = {
    appointment_img,
    header_img,
    group_profiles,
    logo,
    chats_icon,
    verified_icon,
    info_icon,
    profile_pic,
    arrow_icon,
    contact_image,
    about_image,
    menu_icon,
    cross_icon,
    dropdown_icon,
    upload_icon,
    stripe_logo,
    razorpay_logo
}

export const specialityData = [
    {
        speciality: 'General physician',
        image: General_physician
    },
    {
        speciality: 'Gynecologist',
        image: Gynecologist
    },
    {
        speciality: 'Dermatologist',
        image: Dermatologist
    },
    {
        speciality: 'Pediatricians',
        image: Pediatricians
    },
    {
        speciality: 'Neurologist',
        image: Neurologist
    },
    {
        speciality: 'Gastroenterologist',
        image: Gastroenterologist
    },
]

export const doctors = [
    {
        _id: 'doc1',
        name: 'Dr. Richard James',
        image: doc1,
        speciality: 'General physician',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 50,
        address: {
            line1: '17th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc2',
        name: 'Dr. Emily Larson',
        image: doc2,
        speciality: 'Gynecologist',
        degree: 'MBBS',
        experience: '3 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 60,
        address: {
            line1: '27th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc3',
        name: 'Dr. Sarah Patel',
        image: doc3,
        speciality: 'Dermatologist',
        degree: 'MBBS',
        experience: '1 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 30,
        address: {
            line1: '37th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc4',
        name: 'Dr. Christopher Lee',
        image: doc4,
        speciality: 'Pediatricians',
        degree: 'MBBS',
        experience: '2 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 40,
        address: {
            line1: '47th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc5',
        name: 'Dr. Jennifer Garcia',
        image: doc5,
        speciality: 'Neurologist',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 50,
        address: {
            line1: '57th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc6',
        name: 'Dr. Andrew Williams',
        image: doc6,
        speciality: 'Neurologist',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 50,
        address: {
            line1: '57th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc7',
        name: 'Dr. Christopher Davis',
        image: doc7,
        speciality: 'General physician',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 50,
        address: {
            line1: '17th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc8',
        name: 'Dr. Timothy White',
        image: doc8,
        speciality: 'Gynecologist',
        degree: 'MBBS',
        experience: '3 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 60,
        address: {
            line1: '27th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc9',
        name: 'Dr. Ava Mitchell',
        image: doc9,
        speciality: 'Dermatologist',
        degree: 'MBBS',
        experience: '1 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 30,
        address: {
            line1: '37th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc10',
        name: 'Dr. Jeffrey King',
        image: doc10,
        speciality: 'Pediatricians',
        degree: 'MBBS',
        experience: '2 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 40,
        address: {
            line1: '47th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc11',
        name: 'Dr. Zoe Kelly',
        image: doc11,
        speciality: 'Neurologist',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 50,
        address: {
            line1: '57th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc12',
        name: 'Dr. Patrick Harris',
        image: doc12,
        speciality: 'Neurologist',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 50,
        address: {
            line1: '57th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc13',
        name: 'Dr. Chloe Evans',
        image: doc13,
        speciality: 'General physician',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 50,
        address: {
            line1: '17th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc14',
        name: 'Dr. Ryan Martinez',
        image: doc14,
        speciality: 'Gynecologist',
        degree: 'MBBS',
        experience: '3 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 60,
        address: {
            line1: '27th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc15',
        name: 'Dr. Amelia Hill',
        image: doc15,
        speciality: 'Dermatologist',
        degree: 'MBBS',
        experience: '1 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 30,
        address: {
            line1: '37th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
]

export const products = [
    {
      _id: 'prod1',
      name: 'T-Shirt',
      image: prod1,
      category: 'Apparel And Accessories',
      price: 25,
      stock: 40,
      description: 'A soft cotton T-shirt with a positive mental health message, perfect for daily wear.',
      deliveryPeriod: '3-5 business days',
      courier: 'Domex',
      reviews: [
        { user: 'Alice Brown', comment: 'Love the fabric, so soft and comfy!', rating: 5 },
        { user: 'Mark Davis', comment: 'Fits perfectly and the message is uplifting.', rating: 4 },
        { user: 'Emily Carter', comment: 'Good quality material.', rating: 5 },
        { user: 'Jake Wilson', comment: 'Would love more color options!', rating: 4 }
      ]
    },
    {
      _id: 'prod2',
      name: 'Self-Care Kit',
      image: prod2,
      category: 'Self-Care And Relaxation',
      price: 50,
      stock: 25,
      description: 'A curated self-care kit with essential wellness products for relaxation and rejuvenation.',
      deliveryPeriod: '4-6 business days',
      courier: 'Pronto',
      reviews: [
        { user: 'Sophia Clark', comment: 'The bath salts and candles are amazing for relaxation!', rating: 5 },
        { user: 'David Lee', comment: 'Great selection of self-care items, worth the price.', rating: 4 },
        { user: 'Sophia Adams', comment: 'I love the scent of the products.', rating: 5 },
        { user: 'Lucas Hill', comment: 'A bit pricey, but worth it.', rating: 4 }
      ]
    },
    {
      _id: 'prod3',
      name: 'Guided Therapy Workbook',
      image: prod3,
      category: 'Books And Journals',
      price: 30,
      stock: 35,
      description: 'A structured therapy workbook designed to help individuals navigate emotional well-being.',
      deliveryPeriod: '5-7 business days',
      courier: 'FedEx',
      reviews: [
        { user: 'Emma Watson', comment: 'Helpful prompts that make self-reflection easier.', rating: 5 },
        { user: 'James Williams', comment: 'A great companion for therapy sessions.', rating: 4 },
        { user: 'Sophia Lopez', comment: 'Well structured and easy to follow.', rating: 5 },
        { user: 'Mason Evans', comment: 'Could use more examples.', rating: 4 }
      ]
    },
    {
      _id: 'prod4',
      name: 'Noise-Canceling Earbuds',
      image: prod4,
      category: 'Productivity And Mental Focus',
      price: 80,
      stock: 20,
      description: 'High-quality noise-canceling earbuds to enhance focus and reduce distractions.',
      deliveryPeriod: '2-4 business days',
      courier: 'Domex',
      reviews: [
        { user: 'Lucas Adams', comment: 'Incredible sound quality and noise cancellation.', rating: 5 },
        { user: 'Sophia Martinez', comment: 'Perfect for work-from-home focus.', rating: 5 },
        { user: 'Jack Miller', comment: 'Comfortable fit for long hours.', rating: 5 },
        { user: 'Liam White', comment: 'A bit expensive but worth it.', rating: 4 }
      ]
    },
    {
      _id: 'prod5',
      name: 'Weighted Blanket',
      image: prod5,
      category: 'Sleep And Wellness Essentials',
      price: 75,
      stock: 18,
      description: 'A cozy weighted blanket that helps improve sleep and reduce anxiety.',
      deliveryPeriod: '6-8 business days',
      courier: 'Pronto',
      reviews: [
        { user: 'Olivia Taylor', comment: 'Best sleep I’ve had in a long time!', rating: 5 },
        { user: 'Liam Scott', comment: 'Really helps with anxiety and deep sleep.', rating: 4 },
        { user: 'Charlotte Green', comment: 'Very soft and calming.', rating: 5 },
        { user: 'James Adams', comment: 'Takes time to get used to but works well.', rating: 4 }
      ]
    },
    {
      _id: 'prod6',
      name: 'Hoodie',
      image: prod6,
      category: 'Apparel And Accessories',
      price: 45,
      stock: 30,
      description: 'A cozy hoodie with an uplifting mental health message, made with premium cotton.',
      deliveryPeriod: '3-5 business days',
      courier: 'FedEx',
      reviews: [
        { user: 'Kevin Brown', comment: 'Super warm and soft, great for chilly days.', rating: 5 },
        { user: 'Sarah Miller', comment: 'Love the motivational message on the hoodie!', rating: 4 },
        { user: 'Liam Johnson', comment: 'Material feels premium.', rating: 5 },
        { user: 'Sophia Martinez', comment: 'Would buy in more colors.', rating: 4 }
      ]
    },
    {
      _id: 'prod7',
      name: 'Aromatherapy Candle',
      image: prod7,
      category: 'Self-Care And Relaxation',
      price: 20,
      stock: 50,
      description: 'A hand-poured candle with a lavender scent, perfect for stress relief.',
      deliveryPeriod: '2-3 business days',
      courier: 'Domex',
      reviews: [
        { user: 'Emily Johnson', comment: 'Soothing scent, perfect for my evening routine.', rating: 5 },
        { user: 'Michael Brown', comment: 'Burns evenly and lasts long.', rating: 4 },
        { user: 'Sophia Brown', comment: 'Perfect for winding down.', rating: 5 },
        { user: 'Ethan Hall', comment: 'Scent could be stronger.', rating: 4 }
      ]
    },
    {
      _id: 'prod8',
      name: 'Affirmation Cards',
      image: prod8,
      category: 'Books And Journals',
      price: 15,
      stock: 60,
      description: 'A set of positive affirmation cards designed to boost self-esteem and motivation.',
      deliveryPeriod: '3-5 business days',
      courier: 'Pronto',
      reviews: [
        { user: 'Jessica Parker', comment: 'Love picking a card every morning for inspiration!', rating: 5 },
        { user: 'Daniel Carter', comment: 'Nice quality, and really motivational.', rating: 4 },
        { user: 'Olivia Walker', comment: 'Uplifting and encouraging.', rating: 5 },
        { user: 'Mason Harris', comment: 'Wish there were more cards.', rating: 4 }
      ]
    },
    {
      _id: 'prod9',
      name: 'Blue Light Blocking Glasses',
      image: prod9,
      category: 'Productivity And Mental Focus',
      price: 35,
      stock: 25,
      description: 'Stylish glasses that reduce eye strain from screen exposure.',
      deliveryPeriod: '4-6 business days',
      courier: 'FedEx',
      reviews: [
        { user: 'Emma Wilson', comment: 'Helps with eye strain from long work hours.', rating: 5 },
        { user: 'Chris Evans', comment: 'Stylish and functional, highly recommend.', rating: 5 },
        { user: 'Ashley Morgan', comment: 'Stylish and effective, my eyes feel much better!', rating: 5 },
        { user: 'David Patterson', comment: 'Lightweight and comfortable, but slightly tight fit.', rating: 5 }
      ]
    },
    {
      _id: 'prod10',
      name: 'Herbal Bath Salts',
      image: prod10,
      category: 'Sleep And Wellness Essentials',
      price: 18,
      stock: 40,
      description: 'Soothing herbal bath salts infused with essential oils for relaxation.',
      deliveryPeriod: '3-5 business days',
      courier: 'Domex',
      reviews: [
        { user: 'Natalie Brooks', comment: 'Feels like a spa at home.', rating: 5 },
        { user: 'Jake Sullivan', comment: 'Smells amazing and really relaxing.', rating: 4 },
        { user: 'Emma Wallace', comment: 'Perfect after a long day.', rating: 5 },
        { user: 'Liam Rogers', comment: 'The scent lasts a long time!', rating: 4 }
      ]
    },
    {
      _id: 'prod11',
      name: 'Cap',
      image: prod11,
      category: 'Apparel And Accessories',
      price: 20,
      stock: 35,
      description: 'A stylish cap with a positive affirmation embroidered on the front.',
      deliveryPeriod: '2-4 business days',
      courier: 'Pronto',
      reviews: [
        { user: 'John Carter', comment: 'Good quality and fits well.', rating: 5 },
        { user: 'Mia Rodriguez', comment: 'Nice stitching, very comfortable.', rating: 4 },
        { user: 'Ethan Clarke', comment: 'Great for casual wear.', rating: 5 },
        { user: 'Sarah Thomas', comment: 'Love the design, simple yet stylish.', rating: 4 }
      ]
    },
    {
      _id: 'prod12',
      name: 'Essential Oil Diffuser',
      image: prod12,
      category: 'Self-Care And Relaxation',
      price: 40,
      stock: 25,
      description: 'A sleek essential oil diffuser that creates a calming atmosphere.',
      deliveryPeriod: '3-5 business days',
      courier: 'FedEx',
      reviews: [
        { user: 'Anna Lee', comment: 'Works perfectly, great for relaxation.', rating: 5 },
        { user: 'Tom Harris', comment: 'Easy to use and very effective.', rating: 4 },
        { user: 'Sophia Wright', comment: 'Adds a peaceful vibe to my home.', rating: 5 },
        { user: 'Jack Nolan', comment: 'Would be great with a timer function.', rating: 4 }
      ]
    },
    {
        _id: 'prod13',
        name: 'Gratitude Journal',
        image: prod13,
        category: 'Books And Journals',
        price: 22,
        stock: 30,
        description: 'A beautifully designed journal to cultivate gratitude and self-reflection.',
        deliveryPeriod: '3-5 business days',
        courier: 'FedEx',
        reviews: [
            { user: 'Samantha Reed', comment: 'Writing in this journal every night has really helped me stay positive.', rating: 5 },
            { user: 'Daniel Clarke', comment: 'Great quality and inspiring prompts.', rating: 4 },
            { user: 'Laura Scott', comment: 'Lovely design, easy to use.', rating: 5 },
            { user: 'Henry Baker', comment: 'Would love more writing space.', rating: 4 }
        ]
    },
    {
        _id: 'prod14',
        name: 'Stress Ball & Fidget Toy Set',
        image: prod14,
        category: 'Productivity And Mental Focus',
        price: 15,
        stock: 50,
        description: 'A set of stress-relief toys to help reduce anxiety and improve focus.',
        deliveryPeriod: '2-4 business days',
        courier: 'Pronto',
        reviews: [
            { user: 'Kevin Adams', comment: 'Perfect for relieving stress during long work hours.', rating: 5 },
            { user: 'Emily Watson', comment: 'Good variety of fidget toys, my kids love them too.', rating: 4 },
            { user: 'Chris Roberts', comment: 'Helps me focus better.', rating: 5 },
            { user: 'Olivia Turner', comment: 'Great quality, but some are too soft.', rating: 4 }
        ]
    },
    {
        _id: 'prod15',
        name: 'Sleep Mask',
        image: prod15,
        category: 'Sleep And Wellness Essentials',
        price: 12,
        stock: 45,
        description: 'A comfortable silk sleep mask to block out light for better sleep.',
        deliveryPeriod: '3-5 business days',
        courier: 'FedEx',
        reviews: [
            { user: 'Lisa Johnson', comment: 'Super soft and blocks out all light, amazing for travel.', rating: 5 },
            { user: 'Michael Brown', comment: 'Comfortable but could be a little more adjustable.', rating: 4 },
            { user: 'Daniel Green', comment: 'Really helps with sleeping.', rating: 5 },
            { user: 'Emma Foster', comment: 'Great for long flights!', rating: 4 }
        ]
    },
    {
        _id: 'prod16',
        name: 'Motivational Socks',
        image: prod16,
        category: 'Apparel And Accessories',
        price: 15,
        stock: 55,
        description: 'Cozy socks with inspiring quotes to start your day with positivity.',
        deliveryPeriod: '3-5 business days',
        courier: 'Domex',
        reviews: [
            { user: 'Olivia Carter', comment: 'Great quality and love the uplifting quotes!', rating: 5 },
            { user: 'Jason Green', comment: 'Very comfortable but wish they had more colors.', rating: 4 },
            { user: 'Jessica Reed', comment: 'Soft and comfy!', rating: 5 },
            { user: 'Liam Parker', comment: 'Stays in place well.', rating: 4 }
        ]
    },
    {
        _id: 'prod17',
        name: 'Herbal Tea Blend',
        image: prod17,
        category: 'Self-Care And Relaxation',
        price: 18,
        stock: 60,
        description: 'A premium herbal tea blend designed to promote relaxation and calmness.',
        deliveryPeriod: '2-4 business days',
        courier: 'Pronto',
        reviews: [
            { user: 'Sophie Martin', comment: 'The lavender in this tea really helps me unwind before bed.', rating: 5 },
            { user: 'Tom Nelson', comment: 'Nice flavor, but I wish it came in a larger package.', rating: 4 },
            { user: 'Emma Collins', comment: 'Great taste and helps with stress.', rating: 5 },
            { user: 'Noah Sanders', comment: 'Good tea but shipping took a while.', rating: 4 }
        ]
    },
    {
        _id: 'prod18',
        name: 'Self-Help Book',
        image: prod18,
        category: 'Books And Journals',
        price: 28,
        stock: 40,
        description: 'A best-selling self-help book focused on mindfulness and mental well-being.',
        deliveryPeriod: '3-5 business days',
        courier: 'FedEx',
        reviews: [
            { user: 'Rachel Adams', comment: 'This book changed my perspective on daily mindfulness.', rating: 5 },
            { user: 'John White', comment: 'Some great advice, but some parts felt a bit repetitive.', rating: 4 },
            { user: 'Samantha Harris', comment: 'Very insightful and helpful.', rating: 5 },
            { user: 'Nathan Brooks', comment: 'Well-written and practical.', rating: 4 }
        ]
    },
    {
        _id: 'prod19',
        name: 'Desk Planner',
        image: prod19,
        category: 'Productivity And Mental Focus',
        price: 22,
        stock: 35,
        description: 'An organized desk planner to help you set goals and stay productive.',
        deliveryPeriod: '3-5 business days',
        courier: 'Domex',
        reviews: [
            { user: 'Chris Bell', comment: 'Keeps me on track with my daily goals. Very helpful!', rating: 5 },
            { user: 'Nancy Foster', comment: 'Great layout, but wish the paper was a little thicker.', rating: 4 },
            { user: 'Sophie Grant', comment: 'Perfect for daily planning and reminders.', rating: 5 },
            { user: 'Liam Turner', comment: 'Nice design, but pages could be more durable.', rating: 4 }
        ]
    },
    {
        _id: 'prod20',
        name: 'Meditation & Relaxation Audio Download',
        image: prod20,
        category: 'Sleep And Wellness Essentials',
        price: 10,
        stock: 70,
        description: 'A collection of meditation and relaxation audio tracks for better sleep and stress relief.',
        deliveryPeriod: '2-4 business days',
        courier: 'Pronto',
        reviews: [
            { user: 'James Scott', comment: 'The guided meditation helped me fall asleep faster.', rating: 5 },
            { user: 'Ella Davis', comment: 'Nice background music, but some tracks are too short.', rating: 4 },
            { user: 'Kevin Hughes', comment: 'Very calming and perfect for relaxation.', rating: 5 },
            { user: 'Emily Rose', comment: 'I love the voice and pacing of the guided meditations.', rating: 4 }
        ]
    }
    

  ];
  
  