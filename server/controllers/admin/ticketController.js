import Ticket from '../../models/Ticket.js';

// @desc    Get all tickets
// @route   GET /api/admin/tickets
// @access  Private/Admin
export const getAllTickets = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tickets = await Ticket.find(query)
      .populate('student', 'username email')
      .populate('assignedTo', 'username')
      .populate('messages.sender', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Ticket.countDocuments(query);

    res.json({
      tickets,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update ticket status
// @route   PUT /api/admin/tickets/:id/status
// @access  Private/Admin
export const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.status = status;

    if (status === 'resolved' || status === 'closed') {
      ticket.resolvedAt = new Date();
      ticket.resolvedBy = req.user._id;
    }

    await ticket.save();

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reply to ticket
// @route   POST /api/admin/tickets/:id/reply
// @access  Private/Admin
export const replyToTicket = async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.messages.push({
      sender: req.user._id,
      message,
    });

    if (ticket.status === 'open') {
      ticket.status = 'in-progress';
    }

    await ticket.save();

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign ticket
// @route   PUT /api/admin/tickets/:id/assign
// @access  Private/Admin
export const assignTicket = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.assignedTo = assignedTo;
    await ticket.save();

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
