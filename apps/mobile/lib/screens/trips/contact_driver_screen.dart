import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../api/api_client.dart';
import '../../api/models.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';

/// Board: ContactDriver. Chat thread with the chauffeur.
class ContactDriverScreen extends ConsumerStatefulWidget {
  const ContactDriverScreen({super.key, required this.id});
  final String id;

  @override
  ConsumerState<ContactDriverScreen> createState() => _ContactDriverScreenState();
}

const _quickReplies = ['I’m outside', 'Running 5 min late', 'Please call me'];

typedef _Msg = ({String key, String sender, String body, String createdAt, bool pending});

String _dayLabel(String iso) {
  final d = parseDate(iso);
  if (d == null) return '';
  final now = DateTime.now();
  bool same(DateTime a, DateTime b) => a.year == b.year && a.month == b.month && a.day == b.day;
  final time = DateFormat('h:mm a').format(d);
  if (same(d, now)) return 'Today $time';
  if (same(d, now.subtract(const Duration(days: 1)))) return 'Yesterday $time';
  return '${DateFormat('EEE, d MMM').format(d)} $time';
}

bool _sameDay(String a, String b) {
  final x = parseDate(a), y = parseDate(b);
  if (x == null || y == null) return x == y;
  return x.year == y.year && x.month == y.month && x.day == y.day;
}

class _ContactDriverScreenState extends ConsumerState<ContactDriverScreen> {
  final _text = TextEditingController();
  Timer? _poll;

  /// Messages the server accepted but the thread hasn't returned yet.
  final List<BookingMessage> _sent = [];

  /// Optimistic messages still being sent.
  final List<_Msg> _pending = [];
  String? _sendError;
  int _seq = 0;

  @override
  void initState() {
    super.initState();
    _text.addListener(() {
      if (mounted) setState(() {});
    });
    _poll = Timer.periodic(const Duration(seconds: 10), (_) {
      if (!mounted) return;
      final live = ref.read(liveStatusProvider(widget.id)).valueOrNull;
      if (live != null && live.messaging) ref.invalidate(messagesProvider(widget.id));
    });
  }

  @override
  void dispose() {
    _poll?.cancel();
    _text.dispose();
    super.dispose();
  }

  Future<void> _send(String body) async {
    final msg = body.trim();
    if (msg.isEmpty) return;
    final tmp = (key: 'tmp-${_seq++}', sender: 'customer', body: msg, createdAt: DateTime.now().toUtc().toIso8601String(), pending: true);
    setState(() {
      _sendError = null;
      _pending.add(tmp);
    });
    try {
      final saved = await ref.read(apiProvider).sendBookingMessage(widget.id, msg);
      if (!mounted) return;
      setState(() {
        _pending.remove(tmp);
        _sent.add(saved);
      });
      ref.invalidate(messagesProvider(widget.id));
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _pending.remove(tmp);
        _sendError = errorText(e, 'Your message wasn’t sent. Please try again.');
        if (_text.text.isEmpty) _text.text = msg;
      });
    }
  }

  void _submit() {
    final msg = _text.text;
    _text.clear();
    _send(msg);
  }

  Future<void> _call(String phone) async {
    final ok = await launchUrl(Uri(scheme: 'tel', path: phone.replaceAll(RegExp(r'[^\d+]'), '')));
    if (!ok && mounted) showRdToast(context, 'We couldn’t start a call.');
  }

  @override
  Widget build(BuildContext context) {
    final liveA = ref.watch(liveStatusProvider(widget.id));
    return liveA.when(
      loading: () => const RdPage(title: 'Your chauffeur', children: [RdLoading()]),
      error: (e, _) => RdPage(title: 'Your chauffeur', children: [RdError(e, onRetry: () => ref.invalidate(liveStatusProvider(widget.id)))]),
      data: _content,
    );
  }

  Widget _content(LiveStatus live) {
    final driver = live.driver;
    final name = driver?.name;
    final phone = driver?.phone;
    final hasName = name != null && name.isNotEmpty;
    final title = (name != null && name.isNotEmpty) ? name : 'Your chauffeur';
    final firstName = (name != null && name.isNotEmpty) ? name.trim().split(RegExp(r'\s+')).first : null;
    final eta = live.etaMinutes;
    final subParts = [
      if ((driver?.vehicle ?? '').isNotEmpty) driver?.vehicle ?? '',
      if (eta != null) '$eta min away',
    ];
    final sub = hasName ? (subParts.isNotEmpty ? subParts.join(' · ') : phone) : 'Not assigned yet';
    final callButton = phone != null && phone.isNotEmpty
        ? Tooltip(
            message: 'Call',
            child: GestureDetector(
              onTap: () => _call(phone),
              child: Container(
                width: 42,
                height: 42,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [RdColors.ctaTop, RdColors.ctaBottom]),
                ),
                child: const Icon(Icons.phone_outlined, size: 19, color: RdColors.ink),
              ),
            ),
          )
        : null;

    if (!live.messaging) {
      return RdPage(
        title: title,
        subtitle: sub,
        trailing: callButton,
        children: [
          RdCard(
            padding: const EdgeInsets.all(18),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Messaging isn’t available for this trip — call your chauffeur.', style: RdText.sans(15, height: 1.5)),
              const SizedBox(height: 12),
              if (phone != null && phone.isNotEmpty)
                RdOutlineButton(label: 'Call $phone', icon: Icons.phone_outlined, onPressed: () => _call(phone))
              else ...[
                Text('Your chauffeur’s number will appear here once one is assigned. Need help now?', style: RdText.sans(13.5, color: RdColors.muted, height: 1.5)),
                RdLink('Get support', onTap: () => context.push('/help'), size: 13.5),
              ],
              const SizedBox(height: 4),
              InkWell(
                onTap: () {
                  if (context.canPop()) {
                    context.pop();
                  } else {
                    context.go('/bookings/${widget.id}');
                  }
                },
                child: Padding(padding: const EdgeInsets.symmetric(vertical: 6), child: Text('Back to booking', style: RdText.sans(14, color: RdColors.muted))),
              ),
            ]),
          ),
        ],
      );
    }

    final thread = ref.watch(messagesProvider(widget.id));
    final server = thread.valueOrNull;
    final serverIds = {for (final m in server ?? const <BookingMessage>[]) m.id};
    final List<_Msg> all = [
      for (final m in server ?? const <BookingMessage>[]) (key: m.id, sender: m.sender, body: m.body, createdAt: m.createdAt, pending: false),
      for (final m in _sent)
        if (!serverIds.contains(m.id)) (key: m.id, sender: m.sender, body: m.body, createdAt: m.createdAt, pending: false),
      ..._pending,
    ];

    Widget list;
    if (server == null && thread.hasError) {
      list = Align(alignment: Alignment.topCenter, child: RdError(thread.error ?? 'error', onRetry: () => ref.invalidate(messagesProvider(widget.id))));
    } else if (server == null) {
      list = const RdLoading();
    } else if (all.isEmpty) {
      list = Center(
        child: Text('No messages yet. Send a note or use a quick reply below.', textAlign: TextAlign.center, style: RdText.sans(13.5, color: RdColors.muted)),
      );
    } else {
      final items = <Widget>[];
      for (var i = 0; i < all.length; i++) {
        final m = all[i];
        if (i == 0 || !_sameDay(all[i - 1].createdAt, m.createdAt)) {
          items.add(Padding(
            padding: const EdgeInsets.symmetric(vertical: 5),
            child: Center(child: Text(_dayLabel(m.createdAt), style: RdText.sans(11.5, color: RdColors.muted))),
          ));
        }
        items.add(Padding(padding: const EdgeInsets.symmetric(vertical: 5), child: _Bubble(m)));
      }
      final reversed = items.reversed.toList();
      // Reversed so the newest message stays in view.
      list = ListView.builder(reverse: true, padding: const EdgeInsets.symmetric(vertical: 4), itemCount: reversed.length, itemBuilder: (_, i) => reversed[i]);
    }

    final canSend = _text.text.trim().isNotEmpty;
    return RdPage(
      title: title,
      subtitle: sub,
      trailing: callButton,
      scroll: false,
      children: [
        Expanded(child: list),
        if (server != null && thread.hasError) const RdErrorText('We couldn’t load your messages.'),
        if (_sendError != null) RdErrorText(_sendError!),
        Wrap(spacing: 8, runSpacing: 8, children: [for (final q in _quickReplies) _QuickReply(label: q, onTap: () => _send(q))]),
        Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: Row(children: [
            Expanded(
              child: Container(
                height: 50,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                alignment: Alignment.centerLeft,
                decoration: BoxDecoration(color: RdColors.card, borderRadius: BorderRadius.circular(25), border: Border.all(color: RdColors.line)),
                child: TextField(
                  controller: _text,
                  maxLength: 1000,
                  textCapitalization: TextCapitalization.sentences,
                  textInputAction: TextInputAction.send,
                  onSubmitted: (_) => _submit(),
                  style: RdText.sans(14.5),
                  cursorColor: RdColors.gold,
                  decoration: InputDecoration(
                    isDense: true,
                    counterText: '',
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    filled: false,
                    contentPadding: EdgeInsets.zero,
                    hintText: 'Message ${firstName ?? 'your chauffeur'}',
                    hintStyle: RdText.sans(14.5, color: RdColors.muted),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Semantics(
              button: true,
              label: 'Send',
              child: GestureDetector(
                onTap: canSend ? _submit : null,
                child: Opacity(
                  opacity: canSend ? 1 : .6,
                  child: Container(
                    width: 50,
                    height: 50,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [RdColors.ctaTop, RdColors.ctaBottom]),
                    ),
                    child: const Icon(Icons.near_me_outlined, size: 19, color: RdColors.ink),
                  ),
                ),
              ),
            ),
          ]),
        ),
      ],
    );
  }
}

class _Bubble extends StatelessWidget {
  const _Bubble(this.m);
  final _Msg m;
  @override
  Widget build(BuildContext context) {
    if (m.sender == 'system') {
      return Center(
        child: FractionallySizedBox(
          widthFactor: .85,
          child: Text(m.body, textAlign: TextAlign.center, style: RdText.sans(12, color: RdColors.muted)),
        ),
      );
    }
    final mine = m.sender == 'customer';
    return Align(
      alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
      child: FractionallySizedBox(
        widthFactor: .75,
        alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
        child: Align(
          alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
          child: Opacity(
            opacity: m.pending ? .7 : 1,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: mine ? RdColors.yellow : RdColors.iconTile,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(16),
                  topRight: const Radius.circular(16),
                  bottomLeft: Radius.circular(mine ? 16 : 4),
                  bottomRight: Radius.circular(mine ? 4 : 16),
                ),
              ),
              child: Text(m.body, style: RdText.sans(14, height: 1.4, color: mine ? RdColors.ink : RdColors.cream)),
            ),
          ),
        ),
      ),
    );
  }
}

class _QuickReply extends StatelessWidget {
  const _QuickReply({required this.label, required this.onTap});
  final String label;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) {
    return Material(
      color: RdColors.card,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999), side: const BorderSide(color: RdColors.line)),
      child: InkWell(
        customBorder: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        onTap: onTap,
        child: Padding(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7), child: Text(label, style: RdText.sans(12.5))),
      ),
    );
  }
}
