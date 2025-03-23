import supplyManagerModel from "../models/supplyManagerModel"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const loginSupplyManager = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await supplyManagerModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export default loginSupplyManager;