import axios from 'axios';

const verifySession = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Authorization token missing'
      });
    }
    const response = await axios.post(
      `http://${process.env.AUTH_SERVICE_URL}/api/internal/verify-session`,
      {},
      {
        headers: {
          // Cookie: req.headers.cookie,
          Authorization: authHeader
        }
      }
    );

    // 🔑 THIS is where req.user is set in VM-1
    req.user = response.data.user;

    next();
  } catch (err) {
      console.error('Auth service error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
export {verifySession}