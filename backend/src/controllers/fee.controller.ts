import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
// import Razorpay from 'razorpay';

// const razorpay = new Razorpay({
//   key_id: (process.env.RAZORPAY_KEY_ID as any) || 'dummy_key',
//   key_secret: (process.env.RAZORPAY_KEY_SECRET as any) || 'dummy_secret',
// });

export const getStudentFees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { student_id } = req.params;

    const result = await pool.query(
      `SELECT sf.*, fs.fee_type 
       FROM student_fees sf
       JOIN fee_structures fs ON sf.fee_structure_id = fs.id
       WHERE sf.student_id = $1 ORDER BY sf.due_date DESC`,
      [student_id]
    );

    res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error('Get fees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createRazorpayOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, fee_id } = req.body;

    if (!amount || !fee_id) {
      res.status(400).json({ error: 'Amount and fee_id are required' });
      return;
    }

    const options = {
      amount: amount * 100, // Razorpay works in paise
      currency: 'INR',
      receipt: `receipt_${fee_id}_${Date.now()}`,
    };

    // const order = await razorpay.orders.create(options);
    // res.status(200).json({ data: order });
    
    res.status(501).json({ error: 'Payment gateway disabled for now' });
  } catch (error) {
    console.error('Razorpay create order error:', error);
    res.status(500).json({ error: 'Payment gateway error' });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fee_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount_paid } = req.body;
    const parentId = req.user?.id;

    // Ideally, verify signature here using crypto

    // Update fee status
    await pool.query(
      `UPDATE student_fees SET status = 'paid' WHERE id = $1`,
      [fee_id]
    );

    // Record payment
    const result = await pool.query(
      `INSERT INTO payments (student_fee_id, parent_id, amount_paid, payment_method, razorpay_order_id, razorpay_payment_id)
       VALUES ($1, $2, $3, 'razorpay', $4, $5) RETURNING *`,
      [fee_id, parentId, amount_paid, razorpay_order_id, razorpay_payment_id]
    );

    res.status(200).json({ message: 'Payment successful', data: result.rows[0] });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
