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

    let query = `SELECT sf.*, fs.fee_type 
                 FROM student_fees sf
                 JOIN fee_structures fs ON sf.fee_structure_id = fs.id
                 ORDER BY sf.due_date DESC`;
    const params = [];

    if (student_id !== 'dummy_student_id') {
      query = `SELECT sf.*, fs.fee_type 
               FROM student_fees sf
               JOIN fee_structures fs ON sf.fee_structure_id = fs.id
               WHERE sf.student_id = $1 ORDER BY sf.due_date DESC`;
      params.push(student_id);
    }

    const result = await pool.query(query, params);
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
    const { fee_id, amount_paid } = req.body;
    const parentId = req.user?.id || null;

    // Simulate successful payment instantly
    await pool.query(
      `UPDATE student_fees SET status = 'paid' WHERE id = $1`,
      [fee_id]
    );

    // Record payment (mocking razorpay IDs)
    const result = await pool.query(
      `INSERT INTO payments (student_fee_id, parent_id, amount_paid, payment_method, razorpay_order_id, razorpay_payment_id)
       VALUES ($1, $2, $3, 'simulated', 'mock_order_id', 'mock_payment_id') RETURNING *`,
      [fee_id, parentId, amount_paid]
    );

    res.status(200).json({ message: 'Payment simulated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const assignFee = async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    const { fee_type, amount, grade, due_date } = req.body;
    
    if (!fee_type || !amount || !grade || !due_date) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    await client.query('BEGIN');

    // Create fee structure
    const fsResult = await client.query(
      `INSERT INTO fee_structures (fee_type, amount, grade) VALUES ($1, $2, $3) RETURNING id`,
      [fee_type, amount, grade]
    );
    const feeStructureId = fsResult.rows[0].id;

    // Get students in grade
    const studentsResult = await client.query(`SELECT id FROM students WHERE grade = $1`, [grade]);
    const students = studentsResult.rows;

    // Assign to students
    for (const student of students) {
      await client.query(
        `INSERT INTO student_fees (student_id, fee_structure_id, amount_due, due_date) VALUES ($1, $2, $3, $4)`,
        [student.id, feeStructureId, amount, due_date]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: `Fee assigned to ${students.length} students` });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Assign fee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};
