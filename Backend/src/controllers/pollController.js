import Poll from "../models/Poll.js";
import Vote from "../models/Vote.js";
import User from "../models/User.js";

export const getPolls = async (req, res, next) => {
  try {
    const polls = await Poll.find({ poll_status: "Active" })
      .populate("created_by", "username")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: polls.length,
      data: polls,
    });
  } catch (error) {
    next(error);
  }
};

export const getPollById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const poll = await Poll.findById(id).populate("created_by", "username");
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found.",
      });
    }

    let userVote = null;
    if (req.user) {
      userVote = await Vote.findOne({ poll_id: id, resident_id: req.user.id });
    }

    res.status(200).json({
      success: true,
      data: {
        ...poll.toObject(),
        userVoted: userVote ? true : false,
        userVotedOption: userVote?.selected_option || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const votePoll = async (req, res, next) => {
  try {
    const { pollId } = req.params;
    const { selected_option } = req.body;

    if (!selected_option) {
      return res.status(400).json({
        success: false,
        message: "selected_option is required",
      });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found.",
      });
    }

    if (poll.poll_status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "This poll is no longer active.",
      });
    }

    const option = poll.options.find((opt) => opt.option_text === selected_option);
    if (!option) {
      return res.status(400).json({
        success: false,
        message: "Invalid option selected.",
      });
    }

    const existingVote = await Vote.findOne({ poll_id: pollId, resident_id: req.user.id });

    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: "You have already voted on this poll.",
      });
    }

    let flatId = req.user.flat_id;
    if (!flatId) {
      const user = await User.findById(req.user.id);
      flatId = user?.flat_id;
    }

    if (!flatId) {
      return res.status(400).json({
        success: false,
        message: "No flat associated with this resident account.",
      });
    }

    const vote = await Vote.create({
      poll_id: pollId,
      resident_id: req.user.id,
      flat_id: flatId,
      selected_option,
      voted_at: new Date(),
    });

    option.vote_count += 1;
    poll.total_votes += 1;
    await poll.save();

    res.status(201).json({
      success: true,
      message: "Vote recorded successfully.",
      data: vote,
    });
  } catch (error) {
    next(error);
  }
};

export const getPollResults = async (req, res, next) => {
  try {
    const { id } = req.params;

    const poll = await Poll.findById(id);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found.",
      });
    }

    const voteCount = await Vote.countDocuments({ poll_id: id });

    res.status(200).json({
      success: true,
      data: {
        poll_id: poll._id,
        question: poll.question,
        total_votes: voteCount,
        options: poll.options.map((opt) => ({
          option_text: opt.option_text,
          vote_count: opt.vote_count,
          percentage:
            voteCount > 0 ? ((opt.vote_count / voteCount) * 100).toFixed(2) : 0,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createPoll = async (req, res, next) => {
  try {
    const { question, description, options, end_date } = req.body;

    if (!question || !options || options.length < 2 || !end_date) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: question, options (min 2), end_date",
      });
    }

    const poll = await Poll.create({
      question,
      description: description || "",
      created_by: req.user.id,
      end_date,
      poll_status: "Active",
      total_votes: 0,
      options: options.map((opt) => ({ option_text: opt, vote_count: 0 })),
    });
    await poll.populate("created_by", "username");

    res.status(201).json({
      success: true,
      message: "Poll created successfully.",
      data: poll,
    });
  } catch (error) {
    next(error);
  }
};

export const closePoll = async (req, res, next) => {
  try {
    const { id } = req.params;

    const poll = await Poll.findById(id);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found.",
      });
    }

    poll.poll_status = "Closed";
    await poll.save();

    res.status(200).json({
      success: true,
      message: "Poll closed successfully.",
      data: poll,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPolls = async (req, res, next) => {
  try {
    const polls = await Poll.find().populate("created_by", "username").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: polls.length,
      data: polls,
    });
  } catch (error) {
    next(error);
  }
};
